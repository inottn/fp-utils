export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function';

export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object';

export const isPromise = <T = any>(val: unknown): val is Promise<T> =>
  isObject(val) && isFunction(val.then) && isFunction(val.catch);

export const isNonEmptyArray = (value: unknown) =>
  Array.isArray(value) && value.length > 0;

export const isEmptyArray = (value: unknown) =>
  Array.isArray(value) && value.length === 0;
