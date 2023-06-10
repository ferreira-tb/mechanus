import { ReactiveEffect } from '@/reactivity/effect';
import { MechanusComputedRef } from '@/reactivity/computed';

export type UnwrapRef<T> = T extends MechanusRef<infer R> ? R : T;
export type MechanusRefOrComputedRef<T = any> = MechanusRef<T> | MechanusComputedRef<T>;

export class MechanusRef<T = any> {
    readonly __deps = new Set<ReactiveEffect<T>>();
    private __value: T;

    constructor(value: T) {
        this.__value = value;
    };

    get value(): T {
        return this.__value;
    };

    set value(newValue: T) {
        if (this.__value === newValue) return;

        const oldValue = this.__value;
        this.__value = newValue;
        triggerRefDeps<T>(this, newValue, oldValue);
    };
};

export function ref<T>(value: T): MechanusRef<T> {
    if (isRef(value)) return value;
    return new MechanusRef(value);
};

export function isRef<T>(value: MechanusRef<T> | T): value is MechanusRef<T>;
export function isRef(value: unknown): value is MechanusRef {
    return Boolean(value && (value instanceof MechanusRef || value instanceof MechanusComputedRef));
};

export function unref<T>(item: MechanusRef<T> | T): T {
    return isRef(item) ? item.value : item;
};

function triggerRefDeps<T>(mechRef: MechanusRef<T>, value: T, oldValue: T) {
    mechRef.__deps.forEach((effect) => effect.run(value, oldValue));
};