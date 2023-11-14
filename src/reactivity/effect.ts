import type { MechanusRefOrComputedRef } from './ref';

export type ReactiveCallback<V, OV> = (value: V, oldValue: OV) => void;

export interface EffectOptions<Immediate = boolean> {
	/**
	 * Trigger the callback immediately on watcher creation.
	 * Old value will be undefined on the first call.
	 * @default false
	 */
	immediate?: Immediate;
	/**
	 * Only run the callback once.
	 * @default false
	 */
	once?: boolean;
	/**
	 * Run the callback synchronously.
	 * If false, the callback will be run asynchronously via queueMicrotask.
	 * @default true
	 */
	sync?: boolean;
}

export type WatchSource<T> = MechanusRefOrComputedRef<T>;
export type WatchCallback<V, OV> = ReactiveCallback<V, OV>;
export type WatchOptions<Immediate = boolean> = EffectOptions<Immediate>;
export type WatchStopHandle = () => void;

export class ReactiveEffect<T = any> {
	readonly #callback: ReactiveCallback<T, T>;

	readonly #once: boolean;
	readonly #sync: boolean;

	#active: boolean = true;
	#source: MechanusRefOrComputedRef<T> | null = null;

	constructor(
		callback: ReactiveCallback<T, T>,
		options: EffectOptions = {},
		source?: MechanusRefOrComputedRef<T>
	) {
		this.#callback = callback;
		if (source) this.#source = source;

		this.#once = options.once ?? false;
		this.#sync = options.sync ?? true;
	}

	public run(value: T, oldValue: T) {
		if (!this.#active) return;

		if (this.#sync) {
			this.#callback(value, oldValue);
		} else {
			queueMicrotask(() => this.#callback(value, oldValue));
		}

		if (this.#once) this.stop();
	}

	public stop() {
		this.#active = false;
		this.#source?.__deps.delete(this);
	}
}

/** Watches a reactive data source and invokes a callback function when the source change. */
export function watch<T, Immediate extends Readonly<boolean> = false>(
	source: WatchSource<T>,
	callback: WatchCallback<T, Immediate extends true ? T | undefined : T>,
	options: WatchOptions<Immediate> = {}
): WatchStopHandle {
	const effect = new ReactiveEffect<T>(callback, options, source);
	source.__deps.add(effect);

	if (options.immediate) effect.run(source.value, undefined as T);

	return () => effect.stop();
}
