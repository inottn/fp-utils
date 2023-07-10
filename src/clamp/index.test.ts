import { clamp } from '.';
import { describe, expect, it } from 'vitest';

describe('clamp', () => {
  it('should be defined', () => {
    expect(clamp).toBeDefined();
  });

  it('should work', () => {
    expect(clamp(0, 1, 2)).toEqual(1);
    expect(clamp(0, -1, 2)).toEqual(0);
    expect(clamp(3, -1, 2)).toEqual(2);
  });
});
