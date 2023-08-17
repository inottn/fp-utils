import { uuid } from '.';
import { describe, expect, it } from 'vitest';

describe('uuid', () => {
  it('should be defined', () => {
    expect(uuid).toBeDefined();
  });

  it('should return a string', () => {
    const id = uuid();
    expect(id).toBeTypeOf('string');
  });

  it('should return a string of specified length', () => {
    [2, 8, 24, 48, 96, 256].forEach((size) => {
      expect(uuid(size)).toHaveLength(size);
    });
  });
});
