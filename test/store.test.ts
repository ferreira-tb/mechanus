import { expect, test } from 'vitest';
import { Mechanus, storeToRefs } from '@/mechanus';
import { computed, isReadonly, ref, readonly } from '@/reactivity/ref';
import { MechanusStoreError } from '@/errors';

test('store', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        const bar = ref('bar');

        return { foo, bar };
    });

    const store = useStore();

    expect(store.foo).toBe('foo');
    expect(store.bar).toBe('bar');
});

test('store already defined', () => {
    const mech = new Mechanus();

    mech.define('store', () => {
        const foo = ref('foo');
        const bar = ref('bar');

        return { foo, bar };
    });

    expect(() => mech.define('store', () => ({ foo: ref('foo') }))).toThrow(MechanusStoreError);
});

test('store value change', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        const bar = ref('bar');

        return { foo, bar };
    });

    const store = useStore();

    expect(store.foo).toBe('foo');
    expect(store.bar).toBe('bar');

    store.foo = 'baz';
    store.bar = 'qux';

    expect(store.foo).toBe('baz');
    expect(store.bar).toBe('qux');
});

test('store to raw', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        const bar = ref('bar');
        const qux = ref(2);

        return { foo, bar, qux };
    });

    const store = useStore();
    const raw = store.$raw();

    expect(raw).toEqual({
        foo: 'foo',
        bar: 'bar',
        qux: 2
    });
});

test('store raw is clonable', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        const bar = ref('bar');

        return { foo, bar };
    });

    const store = useStore();
    const raw = store.$raw();

    expect(() => structuredClone(store)).toThrow();
    expect(() => structuredClone(raw)).not.toThrow();
});

test('use store', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        const bar = ref('bar');

        return { foo, bar };
    });

    const store = useStore();
    const usedStore = mech.use('store');
    expect(usedStore).toBe(store);
});

test('use store not defined', () => {
    const mech = new Mechanus();
    expect(() => mech.use('store')).toThrow(MechanusStoreError);
});

test('store to refs', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        const bar = ref('bar');

        return { foo, bar };
    });

    const store = useStore();
    const refs = storeToRefs(store);

    expect(refs.foo.value).toBe('foo');
    expect(refs.bar.value).toBe('bar');
});

test('store to refs value change', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        const bar = ref('bar');

        return { foo, bar };
    });

    const store = useStore();
    const refs = storeToRefs(store);

    expect(refs.foo.value).toBe('foo');
    expect(refs.bar.value).toBe('bar');

    expect(store.foo).toBe('foo');
    expect(store.bar).toBe('bar');

    refs.foo.value = 'baz';
    refs.bar.value = 'qux';

    expect(refs.foo.value).toBe('baz');
    expect(refs.bar.value).toBe('qux');

    expect(store.foo).toBe('baz');
    expect(store.bar).toBe('qux');
});

test('refs from the store are the same', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        const bar = ref('bar');

        return { foo, bar };
    });

    const store = useStore();
    const { foo, bar } = storeToRefs(store);
    const { foo: foo2, bar: bar2 } = storeToRefs(store);

    expect(foo).toBe(foo2);
    expect(bar).toBe(bar2);

    expect(foo.value).toBe('foo');
    expect(foo2.value).toBe('foo');
    foo.value = 'baz';
    expect(foo.value).toBe('baz');
    expect(foo2.value).toBe('baz');

    expect(bar.value).toBe('bar');
    expect(bar2.value).toBe('bar');
    bar.value = 'qux';
    expect(bar.value).toBe('qux');
    expect(bar2.value).toBe('qux');
});

test('computed from store', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        const bar = ref('bar');

        return { foo, bar };
    });

    const store = useStore();
    const { foo, bar } = storeToRefs(store);

    const baz = computed([foo, bar], () => foo.value + bar.value);
    expect(baz.value).toBe('foobar');
});

test('computed from store value change', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        const bar = ref('bar');

        return { foo, bar };
    });

    const store = useStore();
    const { foo, bar } = storeToRefs(store);

    const baz = computed([foo, bar], () => foo.value + bar.value);
    expect(baz.value).toBe('foobar');

    foo.value = 'baz';
    bar.value = 'qux';
    expect(baz.value).toBe('bazqux');
});

test('store computed', () => {
    const mech = new Mechanus();

    const foo = ref('foo');
    const bar = ref('bar');

    const useStore = mech.define('store', () => {
        const qux = computed([foo, bar], () => foo.value + bar.value);

        return { qux };
    });

    const store = useStore();
    expect(store.qux).toBe('foobar');

    foo.value = 'baz';
    bar.value = 'qux';
    expect(store.qux).toBe('bazqux');
});

test('store computed to refs', () => {
    const mech = new Mechanus();

    const foo = ref('foo');
    const bar = ref('bar');

    const useStore = mech.define('store', () => {
        const qux = computed([foo, bar], () => foo.value + bar.value);

        return { qux };
    });

    const store = useStore();
    const { qux } = storeToRefs(store);

    expect(qux.value).toBe('foobar');

    foo.value = 'baz';
    bar.value = 'qux';
    expect(qux.value).toBe('bazqux');
});

test('patch store values', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        const bar = ref('bar');

        return { foo, bar };
    });

    const store = useStore();

    expect(store.foo).toBe('foo');
    expect(store.bar).toBe('bar');

    store.$patch({ foo: 'baz', bar: 'qux' });
    expect(store.foo).toBe('baz');
    expect(store.bar).toBe('qux');

    store.$patch({ foo: 'foo' });
    expect(store.foo).toBe('foo');
    expect(store.bar).toBe('qux');
});

test('cannot set non-ref properties', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        return { foo };
    });

    const store = useStore();

    expect(() => ((store as any).bar = 'bar')).toThrow();
    expect(() => ((store as any).__mech__raw = 'hi')).toThrow();
    expect(() => (store.$patch = () => void 0)).toThrow();
    expect(() => (store.$raw = () => void 0 as any)).toThrow();
});

test('raw does not include actions', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        const bar = ref('bar');

        const baz = () => foo.value + bar.value;

        return { foo, bar, baz };
    });

    const store = useStore();

    const raw = store.$raw({ actions: false });

    expect(raw).toEqual({ foo: 'foo', bar: 'bar' });
    expect(raw.baz).toBeUndefined();
});

test('raw includes actions', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        const bar = ref('bar');

        const baz = () => foo.value + bar.value;

        return { foo, bar, baz };
    });

    const store = useStore();
    
    const raw = store.$raw({ actions: true });
    expect(raw.baz).toBeInstanceOf(Function);
});

test('raw is the same as spread', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        const bar = ref('bar');

        return { foo, bar };
    });

    const store = useStore();

    const raw = store.$raw();
    const spread = { ...store };

    expect(raw).toEqual(spread);
});

test('raw is the same as spread, even after patching', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        const bar = ref('bar');

        return { foo, bar };
    });

    const store = useStore();
    store.$patch({ foo: 'baz' });

    const raw = store.$raw();
    const spread = { ...store };

    expect(raw).toEqual(spread);
});

test('patch wont overwrite actions', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');

        const bar = () => foo.value;

        return { foo, bar };
    });

    const store = useStore();
    store.$patch({ bar: () => 'baz' });

    expect(store.bar()).toBe('foo');
});

test('extracted readonly refs are readonly', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        const bar = computed([foo], () => foo.value);
        const baz = readonly(foo);

        return { foo, bar, baz };
    });

    const store = useStore();
    const { foo, bar, baz } = storeToRefs(store);

    expect(isReadonly(foo)).toBe(false);
    expect(isReadonly(bar)).toBe(true);
    expect(isReadonly(baz)).toBe(true);

    expect(() => ((bar as any).value = 'bar')).toThrow();

    (baz as any).value = 'baz';
    expect(baz.value).toBe('foo');
});

test('patch wont overwrite readonly refs', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        const bar = computed([foo], () => foo.value);
        const baz = readonly(foo);

        return { foo, bar, baz };
    });

    const store = useStore();

    store.$patch({ bar: 'baz' });
    expect(store.bar).toBe('foo');
    expect(store.$raw().bar).toBe('foo');
    expect({ ...store }.bar).toBe('foo');

    store.$patch({ baz: 'baz' });
    expect(store.baz).toBe('foo');
    expect(store.$raw().baz).toBe('foo');
    expect({ ...store }.baz).toBe('foo');

    expect(store.$raw()).toEqual({ foo: 'foo', bar: 'foo', baz: 'foo' });
    expect({ ...store }).toEqual({ foo: 'foo', bar: 'foo', baz: 'foo' });

    store.$patch({ foo: 'bazz', bar: 'nwah', baz: 'qux' });
    expect(store.$raw()).toEqual({ foo: 'bazz', bar: 'bazz', baz: 'bazz' });
    expect({ ...store }).toEqual({ foo: 'bazz', bar: 'bazz', baz: 'bazz' });
});

test('use store with patch function', async () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        const bar = ref('bar');

        return { foo, bar };
    });

    const store = useStore(() => ({ foo: 'baz', bar: 'qux' }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(store.foo).toBe('baz');
    expect(store.bar).toBe('qux');
    expect(store.$raw()).toEqual({ foo: 'baz', bar: 'qux' });
});

test('use store with patch function (async)', async () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', () => {
        const foo = ref('foo');
        const bar = ref('bar');

        return { foo, bar };
    });

    const store = useStore(() => Promise.resolve({ foo: 'baz', bar: 'qux' }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(store.foo).toBe('baz');
    expect(store.bar).toBe('qux');
    expect(store.$raw()).toEqual({ foo: 'baz', bar: 'qux' });
});