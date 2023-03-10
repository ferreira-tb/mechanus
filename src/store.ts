import type { RawType } from '@/types';

export class MechanusStore<T extends RawType> {
    /** The initial value of the store. */
    readonly #initial: T;
    /** The unproxied value of the store. */
    #raw: T;

    constructor(value: T) {
        this.#initial = value;
        this.#raw = value;
    };

    /** Returns the unproxied value of the store. */
    public $raw(): RawType {
        return this.#raw;
    };

    /** Resets the store to its initial value. */
    public $reset(): void {
        this.#raw = this.#initial;
    };
};