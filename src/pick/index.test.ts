import { pick } from '.';
import { describe, expect, it } from 'vitest';

describe('pick', () => {
  it('should be defined', () => {
    expect(pick).toBeDefined();
  });

  it('should work', () => {
    expect(pick({}, [])).toEqual({});
    expect(pick({ a: 1 }, [])).toEqual({});
    expect(pick({ a: 1 }, ['a'])).toEqual({ a: 1 });
    expect(pick({ a: 1, b: 2 }, ['a'])).toEqual({ a: 1 });
    expect(pick({ a: undefined }, ['a'])).toEqual({ a: undefined });
  });
});
