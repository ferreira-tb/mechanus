import { ReactiveEffect } from '@/reactivity/effect';
import { MechanusComputedRefError } from '@/errors';
import type { MechanusRefOrComputedRef } from '@/reactivity/ref';

export type UnwrapComputed<T> = T extends MechanusComputedRef<infer U> ? U : T;

export class MechanusComputedRef<T = any> {
    /**
     * Computed ref dependencies.
     * @internal
     */
    readonly __deps = new Set<ReactiveEffect<T>>();
    /**
     * Computed ref symbol key.
     * @internal
     */
    readonly __symbol: symbol;
    /**
     * Computed ref effect.
     * @internal
     */
    readonly __effect: ReactiveEffect<T>;

    #value!: T;

    constructor(symbol: symbol, effect: ReactiveEffect<T>) {
        this.__symbol = symbol;
        this.__effect = effect;
    };

    get value(): T {
        return this.#value;
    };

    #triggerComputedRefDeps<T>(computedRef: MechanusComputedRef<T>, value: T, oldValue: T) {
        computedRef.__deps.forEach((effect) => effect.run(value, oldValue));
    };

    /**
     * Updates the computed ref value.
     * @internal
     * @param symbolKey Symbol key to check if it matches the computed ref symbol key.
     * @param newValue Computed ref new value.
     */
    public __update(symbolKey: symbol, newValue: T) {
        if (symbolKey !== this.__symbol) {
            throw new MechanusComputedRefError('Computed ref symbol key does not match.');
        };

        const oldValue = this.value;
        this.#value = newValue;
        this.#triggerComputedRefDeps<T>(this, newValue, oldValue);
    };
};

export function computed<T>(refs: MechanusRefOrComputedRef[], computedValue: () => T): MechanusComputedRef<T> {
    const symbol = Symbol();
    const effect = new ReactiveEffect<T>(update);
    const computedRef = new MechanusComputedRef<T>(symbol, effect);
    update();

    function update() {
        const newValue = computedValue();
        computedRef.__update(symbol, newValue);
    };

    refs.forEach((ref) => ref.__deps.add(effect));
    return computedRef;
};