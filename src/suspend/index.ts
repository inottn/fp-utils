import { withResolvers } from '../withResolvers';
import { isPromise } from '../utils';
import type { MaybePromise } from '../types';

export function suspend<Args extends unknown[], AwaitedType>(
  fn: (...args: Args) => MaybePromise<AwaitedType>
) {
  let suspended = false;
  let timer: ReturnType<typeof setTimeout>;
  let resumePromise = Promise.resolve();
  let resumeResolve: ReturnType<typeof withResolvers<void>>['resolve'];
  const queue: {
    args: Args;
    resolve: ReturnType<typeof withResolvers<AwaitedType>>['resolve'];
    reject: ReturnType<typeof withResolvers<AwaitedType>>['reject'];
  }[] = [];

  const suspend = (time?: number) => {
    if (!suspended) {
      ({ promise: resumePromise, resolve: resumeResolve } =
        withResolvers<void>());
    }
    suspended = true;
    if (typeof time === 'number') {
      timer = setTimeout(resume, time);
    }
  };

  const suspendAndInvoke = (...args: Args) => {
    suspend();
    return fn(...args);
  };

  const resume = () => {
    suspended = false;
    clearTimeout(timer);
    resumeResolve();
    flushQueue();
  };

  const waitForResume = () => {
    return resumePromise;
  };

  const flushQueue = () => {
    while (queue.length) {
      const { args, resolve, reject } = queue.shift()!;
      const result = fn(...args);
      if (isPromise(result)) result.then(resolve, reject);
      resolve(result);
    }
  };

  const isSuspended = () => suspended;

  const returnFn = (...args: Args) => {
    if (suspended) {
      const { promise, resolve, reject } = withResolvers<AwaitedType>();
      queue.push({ args, resolve, reject });
      return promise;
    }
    return fn(...args);
  };

  returnFn.suspend = suspend;
  returnFn.suspendAndInvoke = suspendAndInvoke;
  returnFn.resume = resume;
  returnFn.waitForResume = waitForResume;
  returnFn.isSuspended = isSuspended;

  return returnFn;
}
