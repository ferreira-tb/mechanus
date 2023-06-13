type ReactiveCallback<V, OV> = (value: V, oldValue: OV) => void;

interface EffectOptions<Immediate = boolean> {
    /**
     * Trigger the callback immediately on watcher creation.
     * Old value will be undefined on the first call.
     * @default false
     */
    immediate?: Immediate;
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

type WatchSource<T> = MechanusRefOrComputedRef<T>;
type WatchCallback<V, OV> = ReactiveCallback<V, OV>;
type WatchOptions<Immediate = boolean> = EffectOptions<Immediate>;
type WatchStopHandle = () => void;