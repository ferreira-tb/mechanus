import { MechanusRef, UnwrapRef, unref, isRef } from '@/reactivity/ref';
import { MechanusStoreError } from '@/errors';
import type { MechanusRefOrComputedRef } from '@/reactivity/ref';
import type { UnwrapComputed, MechanusComputedRef } from '@/reactivity/computed';

export type StoreRawValues<T = any> = {
    [K in keyof T]:
        T[K] extends MechanusRef ? UnwrapRef<T[K]> :
        T[K] extends MechanusComputedRef ? UnwrapComputed<T[K]> :
        T[K];
};

export type MechanusStore<T = any> = StoreRawValues<T> & {
    /**
     * Patch the store with a partial state.
     * @param partialState The partial state to patch the store with.
     */
    $patch(partialState: Partial<StoreRawValues<T>>): void;
    /**
     * Convert the store to a plain object that can be cloned.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
     */
    $raw(): StoreRawValues<T>;
}

export type StoreRefs<R = any> = {
    [K: string]: MechanusRefOrComputedRef<R>;
};

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
                    return (partialState: Partial<StoreRawValues<T>>): void => self.#patch(store, partialState);
                } else if (key === '$raw') {
                    return (): StoreRawValues<T> => self.#raw(store);
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

    #patch<T extends StoreRefs, U extends MechanusStore<T>>(store: U, partialState: Partial<U>): void {
        for (const [key, value] of Object.entries(partialState) as [keyof U, U[keyof U]][]) {
            store[key] = value;
        };
    };

    #raw<T extends StoreRefs>(store: MechanusStore): StoreRawValues<T> {
        return Object.entries(store).reduce((acc, [key, value]) => {
            acc[key as keyof T] = unref(value);
            return acc;
        }, {} as StoreRawValues<T>);
    };

    public define<T extends StoreRefs>(name: string, refs: T): () => MechanusStore<T>;
    public define<T extends StoreRefs>(name: string, storeSetup: () => T): () => MechanusStore<T>;
    public define<T extends StoreRefs>(name: string, storeSetupOrRefs: (() => T) | T): () => MechanusStore<T> {
        if (this.#stores.has(name)) {
            throw new MechanusStoreError(`Store "${name}" is already defined.`);
        };

        const storeRefs = typeof storeSetupOrRefs === 'function' ? storeSetupOrRefs() : storeSetupOrRefs;
        const store = this.#createStore<T>(storeRefs);
        this.#stores.set(name, store);

        return (): MechanusStore<T> => this.use<T>(name);
    };

    public use<T extends StoreRefs>(name: string): MechanusStore<T> {
        const store = this.#stores.get(name);
        if (!store) throw new MechanusStoreError(`Store "${name}" is not defined.`);
        return store as MechanusStore<T>;
    };
};

export function storeToRefs<T extends StoreRefs>(store: MechanusStore<T>): T {
    return store.__mech__raw as T;
};