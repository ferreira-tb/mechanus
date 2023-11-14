import { ReactiveEffect } from './effect';
import { MechanusComputedRefError } from '../errors';

export type UnwrapRef<T> = T extends MechanusRef<infer R> ? R : T;
export type UnwrapReadonlyRef<T> = T extends ReadonlyMechanusRef<infer R>
	? R
	: T;
export type UnwrapComputedRef<T> = T extends MechanusComputedRef<infer U>
	? U
	: T;

export type MechanusRefOrComputedRef<T = any> =
	| MechanusRef<T>
	| MechanusComputedRef<T>
	| ReadonlyMechanusRef<T>;

export type ReadonlyMechanusRef<T = any> = Omit<MechanusRef<T>, 'value'> & {
	readonly value: T;
};

export class MechanusRef<T = any> {
	/**
	 * Ref dependencies.
	 * @internal
	 */
	readonly __deps = new Set<ReactiveEffect<T>>();

	#value: T;

	constructor(value: T) {
		this.#value = value;
	}

	get value(): T {
		return this.#value;
	}

	set value(newValue: T) {
		if (this.#value === newValue) return;

		const oldValue = this.#value;
		this.#value = newValue;
		this.#triggerRefDeps<T>(this, newValue, oldValue);
	}

	#triggerRefDeps<T>(mechRef: MechanusRef<T>, value: T, oldValue: T) {
		mechRef.__deps.forEach((effect) => effect.run(value, oldValue));
	}
}

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
	}

	get value(): T {
		return this.#value;
	}

	#triggerComputedRefDeps<T>(
		computedRef: MechanusComputedRef<T>,
		value: T,
		oldValue: T
	) {
		computedRef.__deps.forEach((effect) => effect.run(value, oldValue));
	}

	/**
	 * Updates the computed ref value.
	 * @internal
	 * @param symbolKey Symbol key to check if it matches the computed ref symbol key.
	 * @param newValue Computed ref new value.
	 */
	public __update(symbolKey: symbol, newValue: T) {
		if (symbolKey !== this.__symbol) {
			throw new MechanusComputedRefError(
				'Computed ref symbol key does not match.'
			);
		}

		const oldValue = this.value;
		this.#value = newValue;
		this.#triggerComputedRefDeps<T>(this, newValue, oldValue);
	}
}

/** Creates a MechanusRef. */
export function ref<T>(value: T): MechanusRef<T> {
	if (isRef<T>(value)) return value;
	return new MechanusRef(value);
}

export function computed<T>(
	refs: MechanusRefOrComputedRef | MechanusRefOrComputedRef[],
	getter: () => T
): MechanusComputedRef<T> {
	const symbol = Symbol();
	const effect = new ReactiveEffect<T>(update);
	const computedRef = new MechanusComputedRef<T>(symbol, effect);
	update();

	function update() {
		const newValue = getter();
		computedRef.__update(symbol, newValue);
	}

	if (!Array.isArray(refs)) refs = [refs];
	refs.forEach((ref) => ref.__deps.add(effect));
	return computedRef;
}

/** Checks if a value is a MechanusRef. */
export function isRef<T>(
	value: MechanusRef<T> | unknown
): value is MechanusRef<T>;
export function isRef<T>(
	value: ReadonlyMechanusRef<T> | unknown
): value is ReadonlyMechanusRef<T>;
export function isRef<T>(
	value: MechanusComputedRef<T> | unknown
): value is MechanusComputedRef<T>;
export function isRef(value: unknown): value is MechanusRef {
	return Boolean(
		value &&
			(value instanceof MechanusRef || value instanceof MechanusComputedRef)
	);
}

/**
 * Unwraps a MechanusRef.
 * Values that are not MechanusRefs are returned as-is.
 */
export function unref<T>(item: MechanusRef<T> | T): T;
export function unref<T>(item: ReadonlyMechanusRef<T> | T): T;
export function unref<T>(item: MechanusComputedRef<T> | T): T;
export function unref(item: unknown) {
	return isRef(item) ? item.value : item;
}

/** Creates a readonly version of a MechanusRef. */
export function readonly<T>(ref: MechanusRef<T>): ReadonlyMechanusRef<T> {
	return new Proxy(ref, {
		get(target, key) {
			if (key === '__isReadonly') return true;
			return Reflect.get(target, key);
		},
		set(target, key, value) {
			if (key === 'value' || key === '__isReadonly') return true;
			return Reflect.set(target, key, value);
		}
	});
}

/**
 * Checks if a value is a readonly ref.
 * Computed refs are always considered readonly.
 */
export function isReadonly(value: unknown): boolean {
	if (value instanceof MechanusComputedRef) return true;
	if (value instanceof MechanusRef) {
		return Boolean((value as any).__isReadonly);
	}

	return false;
}
