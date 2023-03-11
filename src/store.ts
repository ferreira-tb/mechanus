import { MechanusRef, UnwrapRef } from '@/reactivity/ref';
import { reactive } from '@/reactivity/reactive';

export type MechanusStore<T = any> = { [K in keyof T]: UnwrapRef<T[K]> };
export type StoreRefs<R = any> = { [K in string]: MechanusRef<R> };
export type StoreRawValues<T extends StoreRefs> = MechanusStore<T>;

export function createStore<T extends StoreRefs>(refs: T): MechanusStore {
    const store: MechanusStore = { ...refs };
    return reactive(store);
};