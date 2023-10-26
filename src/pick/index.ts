export function pick<Obj extends object, Key extends keyof Obj>(
  obj: Obj,
  keys: Key[],
) {
  return keys.reduce(
    (n, k) => {
      if (k in obj) {
        n[k] = obj[k];
      }
      return n;
    },
    {} as Pick<Obj, Key>,
  );
}
