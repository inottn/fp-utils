import { sleep } from '../sleep';
import { isFunction } from '../utils';

export function retry<Args extends unknown[], AwaitedType>(
  fn: (...args: Args) => Promise<AwaitedType>,
  retries: number,
  interval?: number | ((args: { retried: number }) => number),
) {
  return function (...args: Args) {
    let retried = 0;

    const inner = (...args: Args): Promise<AwaitedType> => {
      return fn(...args)
        .then((data) => {
          retried = 0;
          return data;
        })
        .catch((error) => {
          if (retried >= retries) throw error;

          const res = interval
            ? sleep(
                isFunction(interval) ? interval({ retried }) : interval,
                () => inner(...args),
              )
            : inner(...args);

          retried++;

          return res;
        });
    };

    return inner(...args);
  };
}
