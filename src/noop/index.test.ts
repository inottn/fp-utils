import { noop } from '.';
import { describe, expect, it } from 'vitest';

describe('noop', () => {
  it('should be defined', () => {
    expect(noop).toBeDefined();
  });

  it('should work', () => {
    expect(noop).toBeTypeOf('function');
    expect(noop()).toEqual(undefined);
  });
});
