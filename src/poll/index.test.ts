import { poll } from '.';
import { describe, expect, it, vi } from 'vitest';

describe('poll', () => {
  it('should be defined', () => {
    expect(poll).toBeDefined();
  });

  it('should work when the retries passed is a number', async () => {
    const mockTypeList = [
      'mockRejectedValue',
      'mockResolvedValue',
      'mockReturnValue',
    ] as const;

    for (const type of mockTypeList) {
      const fn = vi.fn()[type](type);
      const retries = 5;
      const onFail = vi.fn();

      vi.useFakeTimers();
      const promise = poll(fn, {
        retries,
        interval: 1000,
        onFail,
      });
      expect(promise).rejects.toThrowError(type);
      await vi.runAllTimersAsync();
      vi.useRealTimers();

      // should stop polling when exceeding the maximum number of retries
      expect(fn).toHaveBeenCalledTimes(retries + 1);

      // should call onFail callback
      expect(onFail).toHaveBeenCalledTimes(1);
      expect(onFail.mock.lastCall).toEqual([type]);
    }
  });

  it('should work when the retries passed is a function', async () => {
    const mockTypeList = [
      'mockRejectedValue',
      'mockResolvedValue',
      'mockReturnValue',
    ] as const;

    for (const type of mockTypeList) {
      const fn = vi.fn()[type](type);
      const retries = vi
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      const onFail = vi.fn();

      vi.useFakeTimers();
      const promise = poll(fn, {
        retries,
        interval: 1000,
        onFail,
      });
      expect(promise).rejects.toThrowError(type);
      await vi.runAllTimersAsync();
      vi.useRealTimers();

      // should stop polling when retries function return false
      expect(fn).toHaveBeenCalledTimes(3);

      // should receive the correct parameters
      expect(retries.mock.calls).toEqual([
        [{ retried: 0 }],
        [{ retried: 1 }],
        [{ retried: 2 }],
      ]);

      // should call onFail callback
      expect(onFail).toHaveBeenCalledTimes(1);
      expect(onFail.mock.lastCall).toEqual([type]);
    }
  });

  it('should work when the validate is passed', () => {
    const fn = vi
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const validate = vi.fn((result) => result);
    const onSuccess = vi.fn();

    vi.useFakeTimers();
    poll(fn, {
      validate,
      interval: 1000,
      onSuccess,
    });
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

    vi.useFakeTimers();
    poll(fn, {
      validate,
      interval: 1000,
      onSuccess,
    });
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

    vi.useFakeTimers();
    const promise = poll(fn, {
      validate,
      interval: 1000,
    });
    await vi.runAllTimersAsync();

    // should return promise
    await expect(promise).resolves.toBe(true);
  });

  it('should work after calling clear method', async () => {
    const fn = vi.fn();
    const onCancel = vi.fn();

    vi.useFakeTimers();
    const { cancel } = poll(fn, {
      interval: 1000,
      onCancel,
    });
    vi.advanceTimersToNextTimer();
    cancel();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();

    // should call onCancel callback
    expect(onCancel).toBeCalledTimes(1);
  });

  it('create poll function', async () => {
    const fn = vi.fn().mockRejectedValue('error');
    const retries = 5;
    const concurrency = 4;

    vi.useFakeTimers();
    const pollFn = poll.create(fn, {
      retries,
      interval: 1000,
    });

    for (let i = 0; i < concurrency; i++) {
      const promise = pollFn();
      expect(promise).rejects.toThrowError('error');
    }

    await vi.runAllTimersAsync();
    vi.useRealTimers();

    expect(fn).toHaveBeenCalledTimes((retries + 1) * concurrency);
  });
});
