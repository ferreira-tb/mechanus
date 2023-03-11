import { createStore } from '@/store';
import { unref } from '@/reactivity/ref';
import type { MechanusStore, StoreRefs, StoreRawValues } from '@/store';

export class Mechanus {
    readonly #stores = new Map<string, MechanusStore>();

    public define<T extends StoreRefs>(name: string, refs: T): () => MechanusStore<T> {
        if (this.#stores.has(name)) {
            throw new TypeError(`Store "${name}" is already defined.`);
        };

        const store = createStore<T>(refs);
        this.#stores.set(name, store);

        return (): MechanusStore<T> => this.use<T>(name);
    };

    public use<T extends StoreRefs>(name: string): MechanusStore {
        const store = this.#stores.get(name);
        if (!store) throw new TypeError(`Store "${name}" is not defined.`);
        return store as MechanusStore<T>;
    };

    public toRaw(store: string | MechanusStore): StoreRawValues<StoreRefs> {
        if (typeof store === 'string') store = this.use(store);
        return Object.entries(store).reduce((acc, [key, value]) => {
            acc[key] = unref(value);
            return acc;
        }, {} as StoreRawValues<StoreRefs>);
    };
};