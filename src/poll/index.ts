import { withResolvers } from '../withResolvers';
import { isFunction, isPromise } from '../utils';
import type { MaybePromise } from '../types';

export type PollOptions<T> = {
  fn: (args: { retried: number; cancel: () => void }) => MaybePromise<T>;
  validate?: (value: T) => boolean;
  interval: number | ((args: { retried: number }) => number);
  retries?: number | ((args: { retried: number }) => boolean);
  onSuccess?: (value: T) => void;
  onFail?: (reason?: any) => void;
  onCancel?: () => void;
};

export function poll<T>(args: PollOptions<T>) {
  const { fn, validate, interval, retries, onCancel, onSuccess, onFail } = args;
  const { promise, resolve, reject } = withResolvers<T>();
  let retried = 0;
  let timer: ReturnType<typeof setTimeout>;

  const process = (value: T) => {
    if (isFunction(validate) && validate(value)) {
      if (isFunction(onSuccess)) onSuccess(value);
      resolve(value);
    } else if (
      isFunction(retries) ? !retries({ retried }) : retried === retries
    ) {
      if (isFunction(onFail)) onFail(value);
      reject(value);
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
      result.then(process).catch(process);
    } else {
      process(result);
    }
  };

  const cancel = () => {
    clearTimeout(timer);
    if (isFunction(onCancel)) onCancel();
  };

  loop();

  return Object.assign(promise, { cancel });
}

poll.create = function <T>(args: PollOptions<T>) {
  return function () {
    return poll(args);
  };
};
