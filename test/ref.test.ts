import { expect, test } from 'vitest';
import { readonly, ref, isRef, unref, MechanusRef } from '@/reactivity/ref';
import { watch } from '@/reactivity/effect';

test('ref', () => {
    const foo = ref('bar');
    expect(foo.value).toBe('bar');
});

test('ref value change', () => {
    const foo = ref('bar');
    expect(foo.value).toBe('bar');

    foo.value = 'baz';
    expect(foo.value).toBe('baz');
});

test('isRef', () => {
    const foo = ref('bar');
    expect(isRef(foo)).toBe(true);
    expect(isRef('baz')).toBe(false);
});

test('unref', () => {
    const foo = ref('bar');
    expect(foo.value).toBe('bar');
    expect(unref(foo)).toBe('bar');
    expect(unref('baz')).toBe('baz');
});

test('readonly ref', () => {
    const foo = ref('bar');
    const readonlyFoo = readonly(foo);
    expect(readonlyFoo.value).toBe('bar');

    (readonlyFoo as any).value = 'baz';
    expect(readonlyFoo.value).toBe('bar');
});

test('readonly ref still instance of MechanusRef', () => {
    const foo = ref('bar');
    const readonlyFoo = readonly(foo);
    expect(readonlyFoo instanceof MechanusRef).toBe(true);

    expect(isRef(readonlyFoo)).toBe(true);
});

test('readonly ref still reactive', () => {
    const foo = ref('bar');
    const readonlyFoo = readonly(foo);
    expect(readonlyFoo.value).toBe('bar');

    foo.value = 'baz';
    expect(readonlyFoo.value).toBe('baz');
});

test('can watch readonly ref', () => {
    const foo = ref('bar');
    const readonlyFoo = readonly(foo);
    expect(readonlyFoo.value).toBe('bar');

    let count = 0;
    watch(readonlyFoo, () => {
        count++;
    });

    foo.value = 'baz';
    expect(count).toBe(1);
});