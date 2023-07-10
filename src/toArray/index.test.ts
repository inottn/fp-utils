import { toArray } from '.';
import { describe, expect, it } from 'vitest';

describe('toArray', () => {
  it('should be defined', () => {
    expect(toArray).toBeDefined();
  });

  it('should work', () => {
    expect(toArray(0)).toEqual([0]);
    expect(toArray('')).toEqual(['']);
    expect(toArray(false)).toEqual([false]);
    expect(toArray([0])).toEqual([0]);
    expect(toArray([''])).toEqual(['']);
    expect(toArray([false])).toEqual([false]);
  });
});
