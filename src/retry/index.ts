export function retry<Args extends unknown[], AwaitedType>(
  fn: (...args: Args) => Promise<AwaitedType>,
  retries: number,
) {
  return function (...args: Args) {
    let retried = 0;

    const inner = (...args: Args): Promise<AwaitedType> => {
      return fn(...args)
        .then((data) => {
          retried = 0;
          return data;
        })
        .catch((error) => {
          if (retried >= retries) throw error;
          retried++;
          return inner(...args);
        });
    };

    return inner(...args);
  };
}
