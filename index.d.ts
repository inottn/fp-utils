declare function cache<Args extends unknown[], AwaitedType>(fn: (...args: Args) => Promise<AwaitedType>): {
    (...args: Args): Promise<AwaitedType>;
    clear: () => void;
    refresh: (...args: Args) => Promise<AwaitedType>;
    retry: (...args: Args) => Promise<AwaitedType>;
};

type pollOptions<T> = {
    fn: () => T | Promise<T>;
    validate: (value: T) => boolean;
    interval: number;
    maxAttempts?: number;
    onClear?: () => void;
    onSuccess?: () => void;
    onFail?: () => void;
};
declare function poll<T>(args: pollOptions<T>): {
    (): void;
    clear: () => void;
};

export { cache, poll, pollOptions };
