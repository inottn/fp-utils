import { withResolvers } from '../withResolvers';
import { isPromise } from '../utils';
import type { MaybePromise } from '../types';

export function lock<Args extends unknown[], AwaitedType>(
  fn: (...args: Args) => MaybePromise<AwaitedType>,
) {
  let locked = false;
  let timer: ReturnType<typeof setTimeout>;
  let unlockPromise = Promise.resolve();
  let unlockResolve: ReturnType<typeof withResolvers<void>>['resolve'];
  const queue: {
    args: Args;
    resolve: ReturnType<typeof withResolvers<AwaitedType>>['resolve'];
    reject: ReturnType<typeof withResolvers<AwaitedType>>['reject'];
  }[] = [];

  const lock = (time?: number) => {
    if (!locked) {
      ({ promise: unlockPromise, resolve: unlockResolve } =
        withResolvers<void>());
    }
    locked = true;
    if (typeof time === 'number') {
      timer = setTimeout(unlock, time);
    }
  };

  const lockAndInvoke = (...args: Args) => {
    lock();
    return fn(...args);
  };

  const unlock = () => {
    locked = false;
    clearTimeout(timer);
    unlockResolve();
    flushQueue();
  };

  const release = () => {
    queue.length = 0;
  };

  const waitForUnlock = () => {
    return unlockPromise;
  };

  const flushQueue = () => {
    while (queue.length) {
      const { args, resolve, reject } = queue.shift()!;
      const result = fn(...args);
      if (isPromise(result)) result.then(resolve, reject);
      resolve(result);
    }
  };

  const isLocked = () => locked;

  const returnFn = (...args: Args) => {
    if (locked) {
      const { promise, resolve, reject } = withResolvers<AwaitedType>();
      queue.push({ args, resolve, reject });
      return promise;
    }
    return fn(...args);
  };

  returnFn.lock = lock;
  returnFn.lockAndInvoke = lockAndInvoke;
  returnFn.unlock = unlock;
  returnFn.waitForUnlock = waitForUnlock;
  returnFn.isLocked = isLocked;
  returnFn.release = release;

  return returnFn;
}
