import { MechanusStoreError } from '@/errors';
import {
    isReadonly,
    unref,
    isRef,
    MechanusComputedRef,
    MechanusRef,
    type MechanusRefOrComputedRef,
    type ReadonlyMechanusRef,
    type UnwrapComputedRef,
    type UnwrapReadonlyRef,
    type UnwrapRef
} from '@/reactivity/ref';

export type StoreAction = (...args: any[]) => any;

export type StoreRawValues<T = any> = {
    [K in keyof T]:
        T[K] extends MechanusRef ? UnwrapRef<T[K]> :
        T[K] extends ReadonlyMechanusRef ? UnwrapReadonlyRef<T[K]> :
        T[K] extends MechanusComputedRef ? UnwrapComputedRef<T[K]> :
        T[K] extends StoreAction ? T[K] :
        never;
};

export type StoreRawValuesWithoutActions<T = any> = {
    [K in keyof T]:
        T[K] extends MechanusRef ? UnwrapRef<T[K]> :
        T[K] extends ReadonlyMechanusRef ? UnwrapReadonlyRef<T[K]> :
        T[K] extends MechanusComputedRef ? UnwrapComputedRef<T[K]> :
        never;
};

export interface MechanusStoreRawOptions {
    /**
     * Whether to include non-ref methods in the raw store.
     * @default false
     */
    readonly actions?: boolean;
};

export type StorePartialState<T = any> = Partial<StoreRawValues<T>>;

export type MechanusStore<T = any> = StoreRawValues<T> & {
    /**
     * Patch the store with a partial state.
     * @param partialState The partial state to patch the store with.
     */
    $patch(partialState: StorePartialState<T>): void;
    /**
     * Convert the store to a plain object.
     */
    $raw<U extends MechanusStoreRawOptions>(
        options?: U
    ): U['actions'] extends true ? StoreRawValues<T> : StoreRawValuesWithoutActions<T>;
};

export type StoreRefs<R = any> = {
    [K: string]: MechanusRefOrComputedRef<R> | StoreAction;
};

export type MaybePromise<T> = T | Promise<T>;
export type UseStorePatchFn<T extends StoreRefs> = (() => MaybePromise<StorePartialState<T> | null>) | null;
export type DefineStoreReturn<T extends StoreRefs> = (patchFn?: UseStorePatchFn<T>) => MechanusStore<T>;

export class Mechanus {
    readonly #stores = new Map<string, MechanusStore>();

    #createStore<T extends StoreRefs>(refs: T): MechanusStore {
        const self = this;
        const store = { ...refs } as MechanusStore;
        return new Proxy(store, {
            get(target, key) {
                if (typeof key !== 'string') {
                    throw new MechanusStoreError('Store keys must be strings.');
                } else if (key === '__mech__raw') {
                    return store;
                } else if (key === '$patch') {
                    return (partialState: Partial<StoreRawValues<T>>) => self.#patch(store, partialState);
                } else if (key === '$raw') {
                    return (options?: MechanusStoreRawOptions) => self.#raw(store, options);
                } else if (key in target) {
                    const item = Reflect.get(target, key);
                    return unref(item);
                };
    
                throw new MechanusStoreError(`Reactive object does not have property "${String(key)}".`);
            },
            set(target, key, value) {
                if (typeof key !== 'string') {
                    throw new MechanusStoreError('Store keys must be strings.');
                } else if (key in target) {
                    const item = Reflect.get(target, key);
                    if (isRef(item)) {
                        item.value = value;
                        return true;
                    } else {
                        throw new MechanusStoreError(`Cannot set value of non-ref property "${key}".`);
                    };
                };
    
                throw new MechanusStoreError(`Reactive object does not have property "${String(key)}".`);
            }
        })
    };

    #patch<T extends StoreRefs, U extends MechanusStore<T>>(store: T, partialState: Partial<U>): void {
        for (const [key, value] of Object.entries(partialState) as [keyof U, U[keyof U]][]) {
            const item = store[key as keyof T];
            if (!isRef(item) || isReadonly(item)) continue;
            item.value = value;
        };
    };

    #raw<T extends StoreRefs>(store: MechanusStore, options: MechanusStoreRawOptions = {}): StoreRawValues<T> {
        const raw = {} as StoreRawValues<T>;
        const { actions = false } = options;
        for (const [key, value] of Object.entries(store)) {
            if (!isRef(value) && !actions) continue;
            raw[key as keyof T] = unref(value);
        };

        return raw;
    };

    /** Define a new store. */
    public define<T extends StoreRefs>(name: string, refs: T): DefineStoreReturn<T>;
    public define<T extends StoreRefs>(name: string, storeSetup: () => T): DefineStoreReturn<T>;
    public define<T extends StoreRefs>(name: string, storeSetupOrRefs: (() => T) | T): DefineStoreReturn<T> {
        if (this.#stores.has(name)) {
            throw new MechanusStoreError(`Store "${name}" is already defined.`);
        };

        const storeRefs = typeof storeSetupOrRefs === 'function' ? storeSetupOrRefs() : storeSetupOrRefs;
        const store = this.#createStore<T>(storeRefs);
        this.#stores.set(name, store);

        return (patchFn = null) => this.use<T>(name, patchFn);
    };

    /**
     * Use an already defined store.
     * @param name Name of the store.
     * @param patchFn A function that returns a partial state to patch the store with.
     * This will always be called asynchronously.
     */
    public use<T extends StoreRefs>(name: string, patchFn: UseStorePatchFn<T> = null): MechanusStore<T> {
        const store = this.#stores.get(name) as MechanusStore<T>;
        if (!store) throw new MechanusStoreError(`Store "${name}" is not defined.`);

        if (typeof patchFn === 'function') {
            Promise.resolve().then(patchFn).then((partialState) => {
                if (partialState && typeof partialState === 'object') {
                    store.$patch(partialState);
                }
            });
        }
        
        return store;
    };
};

export function storeToRefs<T extends StoreRefs>(store: MechanusStore<T>): T {
    return store.__mech__raw as T;
};