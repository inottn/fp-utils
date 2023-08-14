import { retry } from '.';
import { describe, expect, it, vi } from 'vitest';

describe('retry', () => {
  it('should be defined', () => {
    expect(retry).toBeDefined();
  });

  it('should retry when the returned promise is rejected', async () => {
    const fn = vi.fn().mockRejectedValue('error');
    const retries = 10;
    const retryFn = retry(fn, retries);
    await expect(retryFn()).rejects.toThrow('error');
    expect(fn).toBeCalledTimes(retries + 1);
    await expect(retryFn()).rejects.toThrow('error');
    expect(fn).toBeCalledTimes((retries + 1) * 2);
  });

  it('should not retry when the returned promise is fulfilled', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce('error')
      .mockRejectedValueOnce('error')
      .mockResolvedValueOnce('resolved');

    const retryFn = retry(fn, 4);
    await expect(retryFn()).resolves.toBe('resolved');
    expect(fn).toBeCalledTimes(3);
  });

  it('should retry after the specified interval', async () => {
    vi.useFakeTimers();

    const interval = 1000;
    const fn = vi
      .fn()
      .mockRejectedValueOnce('error')
      .mockRejectedValueOnce('error')
      .mockResolvedValueOnce('resolved');

    const retryFn = retry(fn, 4, interval);
    retryFn();
    await vi.advanceTimersByTimeAsync(interval);
    expect(fn).toBeCalledTimes(2);
    await vi.advanceTimersByTimeAsync(interval);
    expect(fn).toBeCalledTimes(3);

    vi.useRealTimers();
  });

  it('interval option can accept function with the retried param', async () => {
    vi.useFakeTimers();

    const interval = 1000;
    const intervalFn = vi.fn().mockReturnValue(interval);
    const fn = vi
      .fn()
      .mockRejectedValueOnce('error')
      .mockRejectedValueOnce('error')
      .mockResolvedValueOnce('resolved');

    const retryFn = retry(fn, 4, intervalFn);
    retryFn();
    await vi.advanceTimersByTimeAsync(interval);
    expect(fn).toBeCalledTimes(2);
    expect(intervalFn.mock.calls).toEqual([[{ retried: 0 }], [{ retried: 1 }]]);

    await vi.advanceTimersByTimeAsync(interval);
    expect(fn).toBeCalledTimes(3);
    expect(intervalFn.mock.calls).toEqual([[{ retried: 0 }], [{ retried: 1 }]]);

    vi.useRealTimers();
  });
});
