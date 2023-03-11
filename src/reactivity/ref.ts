import { ReactiveEffect } from '@/reactivity/effect';

export interface MechanusRefOptions<T = any> {
    readonly validator?: ((value: unknown) => value is T) | null;
    readonly throwOnInvalid?: boolean;
    readonly errorClass?: new (message: string) => Error;
};

export type UnwrapRef<T> = T extends MechanusRef<infer R> ? R : T;

class MechanusRef<T = any> {
    readonly _isRef = true;
    readonly _deps = new Set<ReactiveEffect>();

    private _value: T;

    private readonly _validator: Required<MechanusRefOptions<T>>['validator'];
    private readonly _throwOnInvalid: Required<MechanusRefOptions<T>>['throwOnInvalid'];
    private readonly _errorClass: Required<MechanusRefOptions<T>>['errorClass'];

    constructor(value: T, options?: MechanusRefOptions<T>) {
        this._value = value;

        // Options.
        this._validator = typeof options?.validator === 'function' ? options.validator : null;
        this._throwOnInvalid = options?.throwOnInvalid === true;
        this._errorClass = typeof options?.errorClass === 'function' ? options.errorClass : TypeError;
    };

    get value(): T {
        return this._value;
    };

    set value(newValue: T) {
        if (this._value === newValue) return;
        if (this._validator && this._validator(newValue) !== true) {
            if (!this._throwOnInvalid) return;
            throw new this._errorClass(`Invalid value for ref: ${newValue}`);
        };

        this._value = newValue;
    };
};

export type { MechanusRef };

export function ref<T>(value: T, options?: MechanusRefOptions<T>): MechanusRef<T> {
    if (isRef<T>(value)) return value;
    return new MechanusRef(value, options);
};

export function isRef<T>(value: MechanusRef<T> | unknown): value is MechanusRef<T>;
export function isRef(value: any): value is MechanusRef {
    return !!(value && value._isRef === true);
};

export function unref<T>(item: MechanusRef<T> | T): T {
    return isRef(item) ? item.value : item;
};