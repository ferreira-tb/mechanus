import { expect, test } from 'vitest';
import { computed, isRef, ref, unref } from '../src/reactivity/ref';
import { computedAsync } from '../src/utils';

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

test('computed is also a ref', () => {
	const foo = ref('bar');
	const baz = computed([foo], () => foo.value + 'baz');
	expect(isRef(baz)).toBe(true);
});

test('computed unref', () => {
	const foo = ref('bar');
	const baz = computed([foo], () => foo.value + 'baz');
	expect(unref(baz)).toBe('barbaz');
});

test('computedAsync', async () => {
	const foo = ref('bar');
	const baz = computedAsync(foo, 5, () => Promise.resolve(foo.value.length));
	expect(baz.value).toBe(5);

	await Promise.resolve();
	expect(baz.value).toBe(3);

	foo.value = 'bazzzzzzz';
	expect(baz.value).toBe(3);

	await Promise.resolve();
	expect(baz.value).toBe(9);
});
