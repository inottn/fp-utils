import { sleep } from '.';
import { describe, expect, it, vi } from 'vitest';

describe('sleep', () => {
  it('should be defined', () => {
    expect(sleep).toBeDefined();
  });

  it('should work', async () => {
    const fn = vi.fn();
    vi.useFakeTimers();
    const result = sleep(100, fn);
    await vi.runAllTimersAsync();
    vi.useRealTimers();
    expect(fn).toBeCalled();
    expect(await result).toBe(undefined);
  });

  it('should work when the callback return a promise', async () => {
    const fn = vi.fn().mockResolvedValueOnce('resolved');
    vi.useFakeTimers();
    const result = sleep(100, fn);
    await vi.runAllTimersAsync();
    vi.useRealTimers();
    expect(fn).toBeCalled();
    expect(await result).toBe('resolved');
  });
});
