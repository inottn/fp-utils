import { lock } from '.';
import { describe, expect, it, vi } from 'vitest';

describe('lock', () => {
  it('should be defined', () => {
    expect(lock).toBeDefined();
  });

  it('should lock function after calling the lock method', () => {
    const fn = vi.fn();
    const lockFn = lock(fn);
    lockFn.lock();
    lockFn();
    expect(fn).not.toBeCalled();
  });

  it('should unlock function after calling the unlock method', () => {
    const fn = vi.fn();
    const lockFn = lock(fn);
    lockFn.lock();
    lockFn();
    expect(fn).not.toBeCalled();

    lockFn.unlock();
    lockFn();
    expect(fn).toBeCalled();
  });

  it('should lock and invoke function after calling the lockAndInvoke method', () => {
    const fn = vi.fn();
    const lockFn = lock(fn);
    lockFn.lockAndInvoke();
    expect(fn).toBeCalled();

    lockFn();
    expect(fn).toBeCalledTimes(1);

    lockFn.unlock();
    lockFn();
    expect(fn).toBeCalledTimes(2);
  });

  it('should lock the time', () => {
    vi.useFakeTimers();

    const fn = vi.fn();
    const lockFn = lock(fn);
    lockFn.lock(100);
    lockFn();
    expect(fn).not.toBeCalled();

    vi.runAllTimers();
    lockFn();
    expect(fn).toBeCalled();

    vi.useRealTimers();
  });
});
