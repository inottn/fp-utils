export function shuffle<T>(array: T[]): T[] {
  let i = array.length;
  let j = 0;

  while (i) {
    j = (Math.random() * i--) | 0;
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}
