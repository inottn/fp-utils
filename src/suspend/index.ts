export function suspend<Args extends unknown[], ReturnValue>(
  fn: (...args: Args) => ReturnValue
) {
  let suspended = false;
  let timer: ReturnType<typeof setTimeout>;

  const suspend = (time?: number) => {
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
    clearTimeout(timer);
    suspended = false;
  };

  const isSuspended = () => suspended;

  const returnFn = (...args: Args) => {
    if (suspended) return;
    return fn(...args);
  };

  returnFn.suspend = suspend;
  returnFn.suspendAndInvoke = suspendAndInvoke;
  returnFn.resume = resume;
  returnFn.isSuspended = isSuspended;

  return returnFn;
}
