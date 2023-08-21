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

type CachedData<AwaitedType> = {
  promise: Promise<AwaitedType>;
  loading: boolean;
};

type CacheOptions<Args extends unknown[], Result> = {
  getKey?: (...args: Args) => unknown;
  cache?: Cache<CacheKey, CachedData<Result>>;
};

export function cache<Args extends unknown[], AwaitedType>(
  fn: (...args: Args) => Promise<AwaitedType>,
  options?: CacheOptions<Args, AwaitedType>,
) {
  const cache = options?.cache ?? new Map<CacheKey, CachedData<AwaitedType>>();
  const getKey = (...args: Args) =>
    options?.getKey ? options.getKey(...args) : JSON.stringify(args);

  const setCache = (key: any, ...args: Args) => {
    const promise = fn(...args);
    const data: CachedData<AwaitedType> = { promise, loading: true };

    promise.then(() => (data.loading = false)).catch(() => cache.delete(key));
    cache.set(key, data);

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

  const retry = (...args: Args) => {
    const key = getKey(...args);
    const cachedData = cache.get(key);
    if (!cachedData || cachedData.loading === false) {
      cache.delete(key);
      return setCache(key, ...args);
    }
    return cachedData.promise;
  };

  const returnFn = (...args: Args) => {
    const key = getKey(...args);
    const cachedData = cache.get(key);
    if (cachedData) return cachedData.promise;
    return setCache(key, ...args);
  };

  returnFn.delete = (...args: Args) => {
    const key = getKey(...args);
    cache.delete(key);
  };
  returnFn.clear = clear;
  returnFn.refresh = refresh;
  returnFn.retry = retry;

  return returnFn;
}
