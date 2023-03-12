import { expect, test } from 'vitest';
import { Mechanus, ref, storeToRefs } from '@/index';

test('store', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', {
        foo: ref('foo'),
        bar: ref('bar')
    });

    const store = useStore();

    expect(store.foo).toBe('foo');
    expect(store.bar).toBe('bar');
});

test('store already defined', () => {
    const mech = new Mechanus();

    mech.define('store', { foo: ref('foo') });
    expect(() => mech.define('store', { foo: ref('foo') })).toThrowError();
});

test('store value change', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', {
        foo: ref('foo'),
        bar: ref('bar')
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

    const useStore = mech.define('store', {
        foo: ref('foo'),
        bar: ref('bar'),
        qux: ref(2)
    });

    const store = useStore();

    expect(mech.toRaw(store)).toEqual({
        foo: 'foo',
        bar: 'bar',
        qux: 2
    });
});

test('use store', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', {
        foo: ref('foo'),
        bar: ref('bar')
    });

    const store = useStore();  
    expect(mech.use('store')).toBe(store);
});

test('use store not defined', () => {
    const mech = new Mechanus();
    expect(() => mech.use('store')).toThrow(TypeError);
});

test('store to refs', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', {
        foo: ref('foo'),
        bar: ref('bar')
    });

    const store = useStore();
    const refs = storeToRefs(store);

    expect(refs.foo.value).toBe('foo');
    expect(refs.bar.value).toBe('bar');
});

test('store to refs value change', () => {
    const mech = new Mechanus();

    const useStore = mech.define('store', {
        foo: ref('foo'),
        bar: ref('bar')
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