import { ReactiveEffect } from '@/reactivity/effect';
import type { MechanusRef } from '@/reactivity/ref';

export type UnwrapComputed<T> = T extends MechanusComputedRef<infer U> ? U : T;

export class MechanusComputedRef<T = any> {
    readonly __isRef = true;
    readonly __isComputedRef = true;
    readonly __deps = new Set<ReactiveEffect<T>>();
    readonly __symbol: symbol;
    readonly __effect: ReactiveEffect<T>;

    private __value!: T;

    constructor(symbol: symbol, effect: ReactiveEffect<T>) {
        this.__symbol = symbol;
        this.__effect = effect;
    };

    get value(): T {
        return this.__value;
    };

    set value(newValue: T) {
        this.__value = newValue;
    };

    public __update(symbolKey: symbol, newValue: T) {
        if (symbolKey !== this.__symbol) {
            throw new TypeError('Computed ref symbol key does not match.');
        };

        const oldValue = this.value;
        this.value = newValue;
        triggerComputedRefDeps<T>(this, newValue, oldValue);
    };
};

export function computed<T>(refs: (MechanusRef | MechanusComputedRef)[], computedValue: () => T): MechanusComputedRef<T> {
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

function triggerComputedRefDeps<T>(computedRef: MechanusComputedRef<T>, value: T, oldValue: T) {
    computedRef.__deps.forEach((effect) => effect.run(value, oldValue));
};