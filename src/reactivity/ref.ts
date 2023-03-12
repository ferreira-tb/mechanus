import { ReactiveEffect } from '@/reactivity/effect';

export interface MechanusRefOptions<T> {
    readonly validator?: ((value: unknown) => value is T) | null;
    readonly throwOnInvalid?: boolean;
    readonly errorClass?: new (message: string) => Error;
};

export type UnwrapRef<T> = T extends MechanusRef<infer R> ? R : T;

export class MechanusRef<T = any> {
    readonly __isRef = true;
    readonly __deps = new Set<ReactiveEffect<T>>();

    private __value: T;

    private readonly __validator: Required<MechanusRefOptions<T>>['validator'];
    private readonly __throwOnInvalid: Required<MechanusRefOptions<T>>['throwOnInvalid'];
    private readonly __errorClass: Required<MechanusRefOptions<T>>['errorClass'];

    constructor(value: T, options?: MechanusRefOptions<T>) {
        this.__value = value;

        // Options.
        this.__validator = typeof options?.validator === 'function' ? options.validator : null;
        this.__throwOnInvalid = options?.throwOnInvalid === true;
        this.__errorClass = typeof options?.errorClass === 'function' ? options.errorClass : TypeError;
    };

    get value(): T {
        return this.__value;
    };

    set value(newValue: T) {
        if (this.__value === newValue) return;
        if (this.__validator && this.__validator(newValue) !== true) {
            if (!this.__throwOnInvalid) return;
            throw new this.__errorClass(`Invalid value for ref: ${newValue}`);
        };

        if (!isPrimitive(newValue)) {
            throw new TypeError('Ref value must be a primitive.');
        } else {
            const oldValue = this.__value;
            this.__value = newValue;
            triggerRefDeps<T>(this, newValue, oldValue);
        };
    };
};

export function ref<T>(value: T, options?: MechanusRefOptions<T>): MechanusRef<T> {
    if (isRef<T>(value)) return value;
    if (!isPrimitive(value)) throw new TypeError('Ref value must be a primitive.');
    return new MechanusRef(value, options) as MechanusRef<T>;
};

export function isRef<T>(value: MechanusRef<T> | T): value is MechanusRef<T>;
export function isRef(value: any): value is MechanusRef {
    return !!(value && value.__isRef === true);
};

export function unref<T>(item: MechanusRef<T> | T): T {
    return isRef(item) ? item.value : item;
};

function triggerRefDeps<T>(mechRef: MechanusRef<T>, value: T, oldValue: T) {
    mechRef.__deps.forEach((effect) => effect.run(value, oldValue));
};

export function isPrimitive(value: unknown): boolean {
    return value === null || (
        typeof value !== 'object' &&
        typeof value !== 'function' &&
        typeof value !== 'symbol'
    );
};