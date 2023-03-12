import type { MechanusRef } from '@/reactivity/ref';

export type ReactiveCallback<T> = (value: T, oldValue: T) => void;
export interface WatchOptions {
    sync?: boolean;
};

export class ReactiveEffect<T = any> {
    private readonly callback: ReactiveCallback<T>;
    private readonly sync: boolean;

    constructor(callback: ReactiveCallback<T>, options?: WatchOptions) {
        this.callback = callback;
        this.sync = options?.sync ?? true;
    };

    public run(value: T, oldValue: T) {
        if (this.sync) {
            this.callback(value, oldValue);
        } else {
            queueMicrotask(() => this.callback(value, oldValue));
        };
    };
};

export function watch<T>(
    ref: MechanusRef<T>,
    callback: ReactiveCallback<T>,
    options?: WatchOptions
): () => void {
    const effect = new ReactiveEffect<T>(callback, options);
    ref.__deps.add(effect);
    return () => void ref.__deps.delete(effect);
};