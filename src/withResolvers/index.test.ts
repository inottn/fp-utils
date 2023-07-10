import { withResolvers } from '.';
import { describe, expect, it } from 'vitest';

describe('withResolvers', () => {
  it('should be defined', () => {
    expect(withResolvers).toBeDefined();
  });

  it('should work when using resolve', () => {
    const { resolve, promise } = withResolvers();
    resolve(1);
    expect(promise).resolves.toBe(1);
  });

  it('should work when using reject', () => {
    const { reject, promise } = withResolvers();
    reject(1);
    expect(promise).rejects.toBe(1);
  });
});
