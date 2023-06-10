import { expect, test } from 'vitest';
import { ref, isRef, unref } from '@/reactivity/ref';

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