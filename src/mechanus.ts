import { MechanusStore } from '@/store';
import type { RawType } from '@/types';

export class Mechanus {
    readonly #stores = new Map<string, MechanusStore<RawType>>();

    public define<T extends RawType>(name: string, value: T): () => MechanusStore<T> {
        if (this.#stores.has(name)) {
            throw new TypeError(`Store "${name}" is already defined.`);
        };

        const store = new MechanusStore<T>(value);
        this.#stores.set(name, store);

        return (): MechanusStore<T> => this.use<T>(name);
    };

    public use<T extends RawType>(name: string): MechanusStore<T> {
        const store = this.#stores.get(name);
        if (!store) throw new TypeError(`Store "${name}" is not defined.`);
        return store as MechanusStore<T>;
    };
};