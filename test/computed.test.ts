import { expect, test } from 'vitest';
import { computed, ref } from '../src/index';

test('computed', () => {
    const foo = ref('bar');
    const baz = computed([foo], () => foo.value + 'baz');
    expect(baz.value).toBe('barbaz');
});

test('computed value change', () => {
    const foo = ref('bar');
    const baz = computed([foo], () => foo.value + 'baz');
    expect(baz.value).toBe('barbaz');

    foo.value = 'baz';
    expect(baz.value).toBe('bazbaz');
});

test('computed many refs', () => {
    const foo = ref('bar');
    const baz = ref('baz');
    const qux = computed([foo, baz], () => foo.value + baz.value);
    expect(qux.value).toBe('barbaz');

    foo.value = 'qux';
    expect(qux.value).toBe('quxbaz');
});

test('computed not primitive', () => {
    const foo = ref('bar');
    const baz = computed([foo], () => ({ foo: foo.value }));
    expect(baz.value).toEqual({ foo: 'bar' });
});

test('computed not primitive value change', () => {
    const foo = ref('bar');
    const baz = computed([foo], () => ({ foo: foo.value }));
    expect(baz.value).toEqual({ foo: 'bar' });

    foo.value = 'baz';
    expect(baz.value).toEqual({ foo: 'baz' });
});

test('computed not primitive many refs', () => {
    const foo = ref('bar');
    const baz = ref('baz');
    const qux = computed([foo, baz], () => ({ foo: foo.value, baz: baz.value }));
    expect(qux.value).toEqual({ foo: 'bar', baz: 'baz' });

    foo.value = 'qux';
    expect(qux.value).toEqual({ foo: 'qux', baz: 'baz' });
});