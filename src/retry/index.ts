import { sleep } from '../sleep';
import { isFunction } from '../utils';

export function retry<AwaitedType>(
  fn: () => Promise<AwaitedType>,
  retries: number,
  interval?: number | ((args: { retried: number }) => number),
) {
  let retried = 0;

  const inner = (): Promise<AwaitedType> => {
    return fn()
      .then((data) => {
        retried = 0;
        return data;
      })
      .catch((error) => {
        if (retried >= retries) throw error;

        const res = interval
          ? sleep(
              isFunction(interval) ? interval({ retried }) : interval,
              inner,
            )
          : inner();

        retried++;

        return res;
      });
  };

  return inner();
}

retry.create = function <AwaitedType>(
  ...args: Parameters<typeof retry<AwaitedType>>
) {
  return function () {
    return retry(...args);
  };
};
