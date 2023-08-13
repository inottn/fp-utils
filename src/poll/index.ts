import { withResolvers } from '../withResolvers';
import { isFunction, isPromise } from '../utils';

export type pollOptions<T> = {
  fn: (args: { retried: number; cancel: () => void }) => T | Promise<T>;
  validate?: (value: T) => boolean;
  interval: number | ((args: { retried: number }) => number);
  retries?: number | ((args: { retried: number }) => boolean);
  onCancel?: () => void;
  onSuccess?: (value: T) => void;
  onFail?: () => void;
};

export function poll<T>(args: pollOptions<T>) {
  const { fn, validate, interval, retries, onCancel, onSuccess, onFail } = args;
  const promisify = !isFunction(onSuccess) && !isFunction(onFail);
  let resolvers: ReturnType<typeof withResolvers> | null;
  let retried = 0;
  let timer: ReturnType<typeof setTimeout>;

  if (promisify) {
    resolvers = withResolvers();
  }

  const process = (value: T) => {
    if (isFunction(validate) && validate(value)) {
      if (isFunction(onSuccess)) onSuccess(value);
      if (promisify) resolvers?.resolve(value);
    } else if (
      isFunction(retries) ? !retries({ retried }) : retried === retries
    ) {
      if (isFunction(onFail)) onFail();
      if (promisify) resolvers?.reject();
    } else {
      timer = setTimeout(
        loop,
        isFunction(interval) ? interval({ retried }) : interval,
      );
    }
    retried++;
  };

  const loop = () => {
    const result = fn({ retried, cancel });

    if (isPromise(result)) {
      result.then(process);
    } else {
      process(result);
    }
  };

  const cancel = () => {
    clearTimeout(timer);
    if (isFunction(onCancel)) onCancel();
    if (promisify) resolvers = null;
  };

  const returnFn = () => {
    loop();
    if (promisify) return resolvers?.promise;
  };
  returnFn.cancel = cancel;

  return returnFn;
}
