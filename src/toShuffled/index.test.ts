import { toShuffled } from '.';
import { describe, expect, it } from 'vitest';

describe('toShuffled', () => {
  it('should be defined', () => {
    expect(toShuffled).toBeDefined();
  });

  it('should work', () => {
    const input = [1, 2, 3, 4];
    const shuffled = toShuffled(input);

    expect(input).not.toBe(shuffled);
    expect(Array.isArray(shuffled)).toBe(true);
  });
});
