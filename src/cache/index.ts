interface Cache<Key, Value> {
  /**
   * Get value for key
   */
  get(key: Key): Value | undefined;
  /**
   * Set value for key
   */
  set(key: Key, value: Value): void;
  /**
   * Return flag if key exists
   */
  has(key: Key): boolean;
  /**
   * Delete value for key
   */
  delete(key: Key): void;
  /**
   * Clear cache
   */
  clear(): void;
}

type CacheKey = any;

type CacheOptions<Args extends unknown[], Result> = {
  getKey: (...args: Args) => unknown;
  cache: Cache<CacheKey, Result>;
};

export function cache<Args extends unknown[], AwaitedType>(
  fn: (...args: Args) => Promise<AwaitedType>,
  options?: CacheOptions<Args, Promise<AwaitedType>>,
) {
  const cache = options?.cache ?? new Map<CacheKey, Promise<AwaitedType>>();
  const getKey = (...args: Args) =>
    options?.getKey ? options.getKey(...args) : JSON.stringify(args);

  const setCache = (key: any, ...args: Args) => {
    const promise = fn(...args);
    promise.catch(() => cache.delete(key));
    cache.set(key, promise);
    return promise;
  };

  const clear = () => {
    cache.clear();
  };

  const refresh = (...args: Args) => {
    const key = getKey(...args);
    cache.delete(key);
    return setCache(key, ...args);
  };

  const returnFn = (...args: Args) => {
    const key = getKey(...args);
    if (cache.has(key)) return cache.get(key);
    return setCache(key, ...args);
  };

  returnFn.delete = (...args: Args) => {
    const key = getKey(...args);
    cache.delete(key);
  };
  returnFn.clear = clear;
  returnFn.refresh = refresh;

  return returnFn;
}
