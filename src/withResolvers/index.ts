export const withResolvers = <T>() => {
  const def = {} as {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
  };
  def.promise = new Promise<T>((_resolve, _reject) => {
    def.resolve = _resolve;
    def.reject = _reject;
  });

  return def;
};
