import { shuffle } from '../shuffle';

export function toShuffled<T>(array: T[]): T[] {
  return shuffle([...array]);
}
