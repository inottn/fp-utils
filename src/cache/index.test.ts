import { cache } from '.';
import { describe, expect, it, vi } from 'vitest';

describe('cache', () => {
  it('should be defined', () => {
    expect(cache).toBeDefined();
  });

  it('should not cache result when the returned promise is rejected', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce('error')
      .mockResolvedValueOnce('cached');
    const cacheFn = cache(fn);
    await expect(cacheFn()).rejects.toThrow('error');

    const result = await cacheFn();
    expect(result).toBe('cached');
  });

  it('should cache result when the returned promise is fulfilled', async () => {
    const fn = vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(2);
    const cacheFn = cache(fn);
    expect(fn).toBeCalledTimes(0);
    expect(await cacheFn()).toBe(1);
    expect(fn).toBeCalledTimes(1);
    expect(await cacheFn()).toBe(1);
    expect(fn).toBeCalledTimes(1);

    fn();
    expect(fn).toBeCalledTimes(2);
    expect(await cacheFn()).toBe(1);
  });

  it('should return the same promise when the returned promise is pending', async () => {
    let cnt = 0;
    const fn = () => {
      cnt++;
      return Promise.resolve(cnt);
    };
    const cacheFn = cache(fn);
    expect(cnt).toBe(0);
    const promise1 = cacheFn();
    const promise2 = cacheFn();
    expect(promise1).toBe(promise2);
  });

  it('should clear cache after calling clear method', async () => {
    let cnt = 0;
    const fn = () => {
      cnt++;
      return Promise.resolve(cnt);
    };
    const cacheFn = cache(fn);
    expect(cnt).toBe(0);
    expect(await cacheFn()).toBe(1);
    expect(cnt).toBe(1);

    cacheFn.clear();
    expect(await cacheFn()).toBe(2);
    expect(cnt).toBe(2);
  });

  it('should retry when the returned promise is fulfilled', async () => {
    let cnt = 0;
    const fn = () => {
      cnt++;
      return Promise.resolve(cnt);
    };
    const cacheFn = cache(fn);
    cacheFn();
    expect(cnt).toBe(1);

    cacheFn.retry();
    expect(await cacheFn()).toBe(1);
    expect(cnt).toBe(1);

    cacheFn.retry();
    expect(await cacheFn()).toBe(2);
    expect(cnt).toBe(2);
  });

  it('should refresh after calling clear method', async () => {
    let cnt = 0;
    const fn = () => {
      cnt++;
      return Promise.resolve(cnt);
    };
    const cacheFn = cache(fn);
    cacheFn();
    expect(cnt).toBe(1);

    cacheFn.refresh();
    expect(await cacheFn()).toBe(2);
    expect(cnt).toBe(2);

    cacheFn.refresh();
    expect(await cacheFn()).toBe(3);
    expect(cnt).toBe(3);
  });
});
