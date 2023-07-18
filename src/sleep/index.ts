import { MaybePromise } from '../types';

export function sleep(ms: number): Promise<void>;
export function sleep<T>(
  ms: number,
  callback: () => MaybePromise<T>
): Promise<T>;
export function sleep<T>(ms: number, callback?: () => MaybePromise<T>) {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(callback?.());
    }, ms)
  );
}
