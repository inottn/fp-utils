import { suspend } from '.';
import { describe, expect, it, vi } from 'vitest';

describe('suspend', () => {
  it('should be defined', () => {
    expect(suspend).toBeDefined();
  });

  it('should suspend function after calling the suspend method', () => {
    const fn = vi.fn();
    const suspendFn = suspend(fn);
    suspendFn.suspend();
    suspendFn();
    expect(fn).not.toBeCalled();
    expect(suspendFn.isSuspended()).toBe(true);
  });

  it('should resume function after calling the resume method', () => {
    const fn = vi.fn();
    const suspendFn = suspend(fn);
    suspendFn.suspend();
    suspendFn();
    expect(fn).not.toBeCalled();
    expect(suspendFn.isSuspended()).toBe(true);

    suspendFn.resume();
    suspendFn();
    expect(fn).toBeCalled();
    expect(suspendFn.isSuspended()).toBe(false);
  });

  it('should suspend and invoke function after calling the suspendAndInvoke method', () => {
    const fn = vi.fn();
    const suspendFn = suspend(fn);
    suspendFn.suspendAndInvoke();
    expect(fn).toBeCalled();
    expect(suspendFn.isSuspended()).toBe(true);

    suspendFn();
    expect(fn).toBeCalledTimes(1);

    suspendFn.resume();
    suspendFn();
    expect(fn).toBeCalledTimes(2);
    expect(suspendFn.isSuspended()).toBe(false);
  });

  it('should suspend the time', () => {
    vi.useFakeTimers();

    const fn = vi.fn();
    const suspendFn = suspend(fn);
    suspendFn.suspend(100);
    suspendFn();
    expect(fn).not.toBeCalled();
    expect(suspendFn.isSuspended()).toBe(true);

    vi.runAllTimers();
    suspendFn();
    expect(fn).toBeCalled();
    expect(suspendFn.isSuspended()).toBe(false);

    vi.useRealTimers();
  });
});
