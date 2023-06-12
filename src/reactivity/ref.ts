import { ReactiveEffect } from '@/reactivity/effect';
import { MechanusComputedRef } from '@/reactivity/computed';

export type UnwrapRef<T> = T extends MechanusRef<infer R> ? R : T;
export type UnwrapReadonlyRef<T> = T extends ReadonlyMechanusRef<infer R> ? R : T;
export type MechanusRefOrComputedRef<T = any> = MechanusRef<T> | MechanusComputedRef<T> | ReadonlyMechanusRef<T>;

export type ReadonlyMechanusRef<T = any> = Omit<MechanusRef<T>, 'value'> & {
    readonly value: T;
};

export class MechanusRef<T = any> {
    readonly __deps = new Set<ReactiveEffect<T>>();
    
    #value: T;

    constructor(value: T) {
        this.#value = value;
    };

    get value(): T {
        return this.#value;
    };

    set value(newValue: T) {
        if (this.#value === newValue) return;

        const oldValue = this.#value;
        this.#value = newValue;
        this.#triggerRefDeps<T>(this, newValue, oldValue);
    };

    #triggerRefDeps<T>(mechRef: MechanusRef<T>, value: T, oldValue: T) {
        mechRef.__deps.forEach((effect) => effect.run(value, oldValue));
    };
};

/** Creates a MechanusRef. */
export function ref<T>(value: T): MechanusRef<T> {
    if (isRef(value)) return value;
    return new MechanusRef(value);
};

/** Checks if a value is a MechanusRef. */
export function isRef<T>(value: MechanusRef<T> | T): value is MechanusRef<T>;
export function isRef<T>(value: ReadonlyMechanusRef<T> | T): value is ReadonlyMechanusRef<T>;
export function isRef<T>(value: MechanusComputedRef<T> | T): value is MechanusComputedRef<T>;
export function isRef(value: unknown): value is MechanusRef {
    return Boolean(value && (value instanceof MechanusRef || value instanceof MechanusComputedRef));
};

/**
 * Unwraps a MechanusRef.
 * Values that are not MechanusRefs are returned as-is.
 */
export function unref<T>(item: MechanusRef<T> | T): T
export function unref<T>(item: ReadonlyMechanusRef<T> | T): T
export function unref<T>(item: MechanusComputedRef<T> | T): T
export function unref(item: unknown) {
    return isRef(item) ? item.value : item;
};

/** Creates a readonly version of a MechanusRef. */
export function readonly<T>(ref: MechanusRef<T>): ReadonlyMechanusRef<T> {
    return new Proxy(ref, {
        get(target, key) {
            return Reflect.get(target, key);
        },
        set(target, key, value) {
            if (key === 'value') return true;
            return Reflect.set(target, key, value);
        }
    });
};