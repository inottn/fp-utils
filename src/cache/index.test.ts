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

    expect(await cacheFn('test')).toBe(2);
    expect(fn).toBeCalledTimes(2);

    fn();
    expect(fn).toBeCalledTimes(3);
    expect(await cacheFn()).toBe(1);
    expect(await cacheFn('test')).toBe(2);
  });

  it('should return the same promise when the returned promise is pending', async () => {
    const fn = vi.fn().mockResolvedValue('cached');
    const cacheFn = cache(fn);
    expect(fn).toBeCalledTimes(0);
    const promise1 = cacheFn();
    const promise2 = cacheFn();
    expect(promise1).toBe(promise2);
    expect(fn).toBeCalledTimes(1);

    const promise3 = cacheFn('test');
    const promise4 = cacheFn('test');
    expect(fn).toBeCalledTimes(2);
    expect(promise1).not.toBe(promise3);
    expect(promise3).toBe(promise4);
  });

  it('should clear cache after calling clear method', async () => {
    const fn = vi.fn().mockResolvedValue('cached');
    const cacheFn = cache(fn);
    expect(fn).toBeCalledTimes(0);
    await cacheFn();
    expect(fn).toBeCalledTimes(1);
    await cacheFn();
    expect(fn).toBeCalledTimes(1);
    await cacheFn('test');
    expect(fn).toBeCalledTimes(2);
    await cacheFn('test');
    expect(fn).toBeCalledTimes(2);
    await cacheFn('test', 'test');
    expect(fn).toBeCalledTimes(3);
    await cacheFn('test', 'test');
    expect(fn).toBeCalledTimes(3);

    cacheFn.clear();
    await cacheFn();
    expect(fn).toBeCalledTimes(4);
    await cacheFn('test');
    expect(fn).toBeCalledTimes(5);
  });

  it('should delete the specified cache after calling delete method', async () => {
    const fn = vi.fn().mockResolvedValue('cached');
    const cacheFn = cache(fn);
    expect(fn).toBeCalledTimes(0);
    await cacheFn();
    expect(fn).toBeCalledTimes(1);
    await cacheFn();
    expect(fn).toBeCalledTimes(1);
    await cacheFn('test');
    expect(fn).toBeCalledTimes(2);
    await cacheFn('test');
    expect(fn).toBeCalledTimes(2);
    await cacheFn('test', 'test');
    expect(fn).toBeCalledTimes(3);
    await cacheFn('test', 'test');
    expect(fn).toBeCalledTimes(3);

    cacheFn.delete('test', 'test');
    await cacheFn();
    expect(fn).toBeCalledTimes(3);
    await cacheFn('test');
    expect(fn).toBeCalledTimes(3);
    await cacheFn('test', 'test');
    expect(fn).toBeCalledTimes(4);
  });

  it('should refresh after calling clear method', async () => {
    const fn = vi.fn().mockResolvedValue('cached');
    const cacheFn = cache(fn);
    cacheFn();
    expect(fn).toBeCalledTimes(1);

    cacheFn.refresh();
    await cacheFn();
    expect(fn).toBeCalledTimes(2);

    cacheFn.refresh();
    await cacheFn();
    expect(fn).toBeCalledTimes(3);
  });
});
