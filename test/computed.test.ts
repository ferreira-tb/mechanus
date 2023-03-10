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

test('computed deps', () => {
    const foo = ref('bar');
    const baz = computed([foo], () => foo.value + 'baz');
    const qux = computed([baz], () => baz.value + 'qux');
    expect(qux.value).toBe('barbazqux');

    foo.value = 'qux';
    expect(qux.value).toBe('quxbazqux');
});

test('computed many deps', () => {
    const foo = ref('bar');
    const baz = computed([foo], () => foo.value + 'baz');
    const qux = computed([baz], () => baz.value + 'qux');
    const quux = computed([qux], () => qux.value + 'quux');
    expect(quux.value).toBe('barbazquxquux');

    foo.value = 'qux';
    expect(quux.value).toBe('quxbazquxquux');
});