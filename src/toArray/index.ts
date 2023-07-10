import { MaybeArray } from '../types';

export function toArray<T>(array: MaybeArray<T>): Array<T> {
  return Array.isArray(array) ? array : [array];
}
