type CacheStatus = 'pending' | 'fulfilled' | 'none';

export function cache<Args extends unknown[], AwaitedType>(
  fn: (...args: Args) => Promise<AwaitedType>
) {
  let cache: typeof fn;
  let status: CacheStatus = 'none';

  const inner = (...args: Args) => {
    const promise = fn(...args);

    status = 'pending';
    cache = () => promise;

    promise
      .then(() => {
        status = 'fulfilled';
      })
      .catch(() => clear());

    return promise;
  };

  cache = inner;

  const clear = () => {
    cache = inner;
    status = 'none';
  };

  const refresh = (...args: Args) => {
    clear();
    return cache(...args);
  };

  const retry = (...args: Args) => {
    if (status === 'fulfilled') clear();
    return cache(...args);
  };

  const returnFn = (...args: Args) => cache(...args);

  returnFn.clear = clear;
  returnFn.refresh = refresh;
  returnFn.retry = retry;

  return returnFn;
}
