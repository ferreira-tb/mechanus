import type { MechanusRef } from '@/reactivity/ref';
import type { MechanusComputedRef } from '@/reactivity/computed';

export type ReactiveCallback<T> = (value: T, oldValue: T) => void;
export interface EffectOptions {
    sync?: boolean;
};

export type WatchOptions = EffectOptions;

export class ReactiveEffect<T = any> {
    private readonly callback: ReactiveCallback<T>;
    private readonly sync: boolean;

    private active: boolean = true;

    constructor(callback: ReactiveCallback<T>, options?: EffectOptions) {
        this.callback = callback;
        this.sync = options?.sync ?? true;
    };

    public run(value: T, oldValue: T) {
        if (!this.active) return;

        if (this.sync) {
            this.callback(value, oldValue);
        } else {
            queueMicrotask(() => this.callback(value, oldValue));
        };
    };

    public stop() {
        this.active = false;
    };
};

export function watch<T>(
    ref: MechanusRef<T> | MechanusComputedRef<T>,
    callback: ReactiveCallback<T>,
    options?: WatchOptions
): () => void {
    const effect = new ReactiveEffect<T>(callback, options);
    ref.__deps.add(effect);

    return () => {
        effect.stop();
        ref.__deps.delete(effect);
    };
};