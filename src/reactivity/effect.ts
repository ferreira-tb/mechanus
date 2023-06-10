import type { MechanusRefOrComputedRef } from '@/reactivity/ref';

export type ReactiveCallback<T> = (value: T, oldValue: T) => void;
export interface EffectOptions {
    /**
     * Trigger the callback immediately on watcher creation.
     * Old value will be undefined on the first call.
     * @default false
     */
    immediate?: boolean;
    /**
     * Only run the callback once.
     * @default false
     */
    once?: boolean;
    /**
     * Run the callback synchronously.
     * If false, the callback will be run asynchronously via queueMicrotask.
     * @default true
     */
    sync?: boolean;
};

export type WatchOptions = EffectOptions;

export class ReactiveEffect<T = any> {
    readonly #callback: ReactiveCallback<T>;
    
    readonly #once: boolean;
    readonly #sync: boolean;

    #active: boolean = true;
    #source: MechanusRefOrComputedRef<T> | null = null;

    constructor(
        callback: ReactiveCallback<T>,
        options: EffectOptions = {},
        source?: MechanusRefOrComputedRef<T>
    ) {
        this.#callback = callback;
        if (source) this.#source = source;

        this.#once = options.once ?? false;
        this.#sync = options.sync ?? true;
    };

    public run(value: T, oldValue: T) {
        if (!this.#active) return;

        if (this.#sync) {
            this.#callback(value, oldValue);
        } else {
            queueMicrotask(() => this.#callback(value, oldValue));
        };

        if (this.#once) this.stop();   
    };

    public stop() {
        this.#active = false;
        this.#source?.__deps.delete(this);
    };
};

/** Watches a reactive data source and invokes a callback function when the source change. */
export function watch<T>(
    source: MechanusRefOrComputedRef<T>,
    callback: ReactiveCallback<T>,
    options: WatchOptions = {}
): () => void {
    const effect = new ReactiveEffect<T>(callback, options, source);
    source.__deps.add(effect);

    if (options.immediate) effect.run(source.value, undefined as T);

    return () => effect.stop();
};

/** Same as `watch` but triggers the callback immediately on watcher creation. */
export function watchImmediate<T>(
    source: MechanusRefOrComputedRef<T>,
    callback: ReactiveCallback<T>,
    options: Omit<WatchOptions, 'immediate'> = {}
): () => void {
    return watch(source, callback, { ...options, immediate: true });
};

/** Same as `watch` but only run the callback once. */
export function watchOnce<T>(
    source: MechanusRefOrComputedRef<T>,
    callback: ReactiveCallback<T>,
    options: Omit<WatchOptions, 'once'> = {}
): () => void {
    return watch(source, callback, { ...options, once: true });
};