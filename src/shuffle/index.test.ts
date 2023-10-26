import { shuffle } from '.';
import { describe, expect, it } from 'vitest';

describe('shuffle', () => {
  it('should be defined', () => {
    expect(shuffle).toBeDefined();
  });

  it('should work', () => {
    const input = [1, 2, 3, 4];
    const shuffled = shuffle(input);

    expect(input).toBe(shuffled);
    expect(Array.isArray(shuffled)).toBe(true);
  });
});
