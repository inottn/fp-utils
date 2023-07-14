export function lock<Args extends unknown[], AwaitedType>(
  fn: (...args: Args) => Promise<AwaitedType>
) {
  let locked = false;
  let timer: ReturnType<typeof setTimeout>;

  const lock = (time?: number) => {
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
    clearTimeout(timer);
    locked = false;
  };

  const returnFn = (...args: Args) => {
    if (locked) return;
    return fn(...args);
  };

  returnFn.lock = lock;
  returnFn.lockAndInvoke = lockAndInvoke;
  returnFn.unlock = unlock;

  return returnFn;
}
