import { poll } from '.';
import { describe, expect, it, vi } from 'vitest';

describe('poll', () => {
  it('should be defined', () => {
    expect(poll).toBeDefined();
  });

  it('should work when the retries passed is a number', () => {
    const fn = vi.fn();
    const retries = 5;
    const onFail = vi.fn();
    const pollFn = poll({
      fn,
      retries,
      interval: 1000,
      onFail,
    });

    vi.useFakeTimers();
    pollFn();
    vi.runAllTimers();
    vi.useRealTimers();

    // should stop polling when exceeding the maximum number of retries
    expect(fn).toHaveBeenCalledTimes(retries);

    // should call onFail callback
    expect(onFail).toHaveBeenCalledTimes(1);
  });

  it('should work when the retries passed is a function', () => {
    const fn = vi.fn();
    const retries = vi
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const onFail = vi.fn();
    const pollFn = poll({
      fn,
      retries,
      interval: 1000,
      onFail,
    });

    vi.useFakeTimers();
    pollFn();
    vi.runAllTimers();
    vi.useRealTimers();

    // should stop polling when retries function return false
    expect(fn).toHaveBeenCalledTimes(3);

    // should receive the correct parameters
    expect(retries.mock.calls).toEqual([
      [{ retried: 1 }],
      [{ retried: 2 }],
      [{ retried: 3 }],
    ]);

    // should call onFail callback
    expect(onFail).toHaveBeenCalledTimes(1);
  });

  it('should work when the validate is passed', () => {
    const fn = vi
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const validate = vi.fn((result) => result);
    const onSuccess = vi.fn();
    const pollFn = poll({
      fn,
      validate,
      interval: 1000,
      onSuccess,
    });

    vi.useFakeTimers();
    pollFn();
    vi.runAllTimers();
    vi.useRealTimers();

    expect(validate).toBeCalledTimes(3);
    expect(validate.mock.calls).toEqual([[false], [false], [true]]);

    // should call onSuccess callback
    expect(onSuccess).toBeCalledTimes(1);
    expect(onSuccess.mock.calls).toEqual([[true]]);
  });

  it('should work when the fn passed return a promise', async () => {
    const fn = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const validate = vi.fn((result) => result);
    const onSuccess = vi.fn();
    const pollFn = poll({
      fn,
      validate,
      interval: 1000,
      onSuccess,
    });

    vi.useFakeTimers();
    pollFn();
    await vi.runAllTimersAsync();
    vi.useRealTimers();

    expect(validate).toBeCalledTimes(3);
    expect(validate.mock.calls).toEqual([[false], [false], [true]]);

    // should call onSuccess callback
    expect(onSuccess).toBeCalledTimes(1);
    expect(onSuccess.mock.calls).toEqual([[true]]);
  });

  it('should work when not pass onSuccess and onFail', async () => {
    const fn = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const validate = vi.fn((result) => result);
    const pollFn = poll({
      fn,
      validate,
      interval: 1000,
    });

    vi.useFakeTimers();
    const promise = pollFn();
    await vi.runAllTimersAsync();

    // should return promise
    await expect(promise).resolves.toBe(true);
  });

  it('should work after calling clear method', async () => {
    const fn = vi.fn();
    const onClear = vi.fn();
    const pollFn = poll({
      fn,
      interval: 1000,
      onClear,
    });

    vi.useFakeTimers();
    pollFn();
    vi.advanceTimersToNextTimer();
    pollFn.clear();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();

    // should call onClear callback
    expect(onClear).toBeCalledTimes(1);
  });
});
