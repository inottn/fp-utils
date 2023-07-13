export function retry<Args extends unknown[], AwaitedType>(
  fn: (...args: Args) => Promise<AwaitedType>,
  retries: number
) {
  return function (...args: Args) {
    let retried = 0;

    const inner = async (...args: Args): Promise<AwaitedType> => {
      const promise = fn(...args);

      try {
        const data = await promise;
        retried = 0;
        return data;
      } catch (error) {
        retried++;
        if (retried >= retries) throw error;
        return await inner(...args);
      }
    };

    return inner(...args);
  };
}
