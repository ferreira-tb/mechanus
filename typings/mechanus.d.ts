type StoreAction = (...args: any[]) => any;

type StoreRawValues<T = any> = {
    [K in keyof T]:
        T[K] extends import('@/reactivity/ref').MechanusRef ? UnwrapRef<T[K]> :
        T[K] extends ReadonlyMechanusRef ? UnwrapReadonlyRef<T[K]> :
        T[K] extends import('@/reactivity/ref').MechanusComputedRef ? UnwrapComputed<T[K]> :
        T[K] extends StoreAction ? T[K] :
        never;
};

type StoreRawValuesWithoutActions<T = any> = {
    [K in keyof T]:
        T[K] extends import('@/reactivity/ref').MechanusRef ? UnwrapRef<T[K]> :
        T[K] extends ReadonlyMechanusRef ? UnwrapReadonlyRef<T[K]> :
        T[K] extends import('@/reactivity/ref').MechanusComputedRef ? UnwrapComputed<T[K]> :
        never;
};

interface MechanusStoreRawOptions {
    /**
     * Whether to include non-ref methods in the raw store.
     * @default false
     */
    readonly actions?: boolean;
};

type MechanusStore<T = any> = StoreRawValues<T> & {
    /**
     * Patch the store with a partial state.
     * @param partialState The partial state to patch the store with.
     */
    $patch(partialState: Partial<StoreRawValues<T>>): void;
    /**
     * Convert the store to a plain object.
     */
    $raw<U extends MechanusStoreRawOptions>(
        options?: U
    ): U['actions'] extends true ? StoreRawValues<T> : StoreRawValuesWithoutActions<T>;
};

type StoreRefs<R = any> = {
    [K: string]: MechanusRefOrComputedRef<R> | StoreAction;
};