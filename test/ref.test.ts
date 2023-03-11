import { expect, test } from 'vitest';
import { isString } from '@tb-dev/ts-guard';
import { ref, isRef, unref } from '@/index';

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

test('ref validator', () => {
    const foo = ref('bar', { validator: isString });
    expect(foo.value).toBe('bar');

    foo.value = 'baz';
    expect(foo.value).toBe('baz');

    foo.value = (123 as unknown) as string;
    expect(foo.value).toBe('baz');
});

test('ref validator with error', () => {
    const foo = ref('bar', { validator: isString, throwOnInvalid: true });
    expect(foo.value).toBe('bar');

    foo.value = 'baz';
    expect(foo.value).toBe('baz');

    expect(() => (foo.value = (123 as unknown) as string)).toThrowError();
});

test('ref validator with custom error', () => {
    const foo = ref('bar', {
        validator: isString,
        throwOnInvalid: true,
        errorClass: ReferenceError
    });

    expect((foo as any)._errorClass).toBe(ReferenceError);
    expect(() => (foo.value = (123 as unknown) as string)).toThrowError(ReferenceError);
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