import { MechanusRef, UnwrapRef, unref, isRef } from '@/reactivity/ref';

export type MechanusStore<T = any> = { [K in keyof T]: UnwrapRef<T[K]> };
export type StoreRefs<R = any> = { [K in string]: MechanusRef<R> };
export type StoreRawValues<T extends StoreRefs> = MechanusStore<T>;

export function createStore<T extends StoreRefs>(refs: T): MechanusStore {
    const store: MechanusStore = { ...refs };
    return new Proxy(store, {
        get(target, key) {
            if (typeof key !== 'string') {
                throw new TypeError('Store keys must be strings.');
            } else if (key in target) {
                const item = Reflect.get(target, key);
                return unref(item);
            };

            throw new TypeError(`Reactive object does not have property "${String(key)}".`);
        },
        set(target, key, value) {
            if (typeof key !== 'string') {
                throw new TypeError('Store keys must be strings.');
            } else if (key in target) {
                const item = Reflect.get(target, key);
                if (isRef(item)) {
                    item.value = value;
                    return true;
                } else {
                    throw new TypeError(`Cannot set value of non-ref property "${key}".`);
                };       
            };

            throw new TypeError(`Reactive object does not have property "${String(key)}".`);
        }
    })
};