import { nanoid } from '.';
import { describe, expect, it } from 'vitest';

describe('nanoid', () => {
  it('should be defined', () => {
    expect(nanoid).toBeDefined();
  });

  it('should return a string', () => {
    const id = nanoid();
    expect(id).toBeTypeOf('string');
  });

  it('should return a string of specified length', () => {
    [2, 8, 24, 48, 96, 256].forEach((size) => {
      expect(nanoid(size)).toHaveLength(size);
    });
  });
});
