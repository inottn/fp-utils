export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function';

export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object';

export const isPromise = <T = any>(val: unknown): val is Promise<T> =>
  isObject(val) && isFunction(val.then) && isFunction(val.catch);

export const isNonEmptyArray = (val: unknown): val is unknown[] =>
  Array.isArray(val) && val.length > 0;

export const isEmptyArray = (val: unknown): val is unknown[] =>
  Array.isArray(val) && val.length === 0;

export const isUndefined = (val: unknown): val is undefined =>
  typeof val === 'undefined';
