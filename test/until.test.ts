import { expect, test } from 'vitest';
import { ref } from '../src/reactivity/ref';
import { until } from '../src/utils';

test('already is', async () => {
	const foo = ref('bar');
	await until(foo).toBe('bar', { timeout: 1000 });
	expect(foo.value).toBe('bar');
});

test('until to be', async () => {
	const foo = ref('bar');
	queueMicrotask(() => (foo.value = 'baz'));

	await until(foo).toBe('baz');
	expect(foo.value).toBe('baz');
});

test('until to be (timeout)', async () => {
	const foo = ref('bar');
	const timeout = setTimeout(() => (foo.value = 'baz'), 1000);

	const options = { timeout: 50, throwOnTimeout: false };
	await expect(until(foo).toBe('baz', options)).resolves.not.toThrowError();
	clearTimeout(timeout);
});

test('until to be (throw on timeout)', async () => {
	const foo = ref('bar');
	const timeout = setTimeout(() => (foo.value = 'baz'), 1000);

	await expect(until(foo).toBe('baz', { timeout: 50 })).rejects.toThrowError();
	expect(foo.value).toBe('bar');
	clearTimeout(timeout);
});

test('until to be (throw on timeout with reason)', async () => {
	const foo = ref('bar');
	const timeout = setTimeout(() => (foo.value = 'baz'), 1000);

	const options = {
		timeout: 50,
		throwOnTimeout: true,
		timeoutReason: 'This is a reason'
	};
	await expect(until(foo).toBe('baz', options)).rejects.toThrowError(
		options.timeoutReason
	);
	expect(foo.value).toBe('bar');
	clearTimeout(timeout);
});

test('until to be falsy', async () => {
	const foo = ref<any>(true);
	queueMicrotask(() => (foo.value = undefined));

	await until(foo).toBeFalsy();
	expect(foo.value).toBeFalsy();
});

test('until to be falsy (timeout)', async () => {
	const foo = ref<any>(true);
	const timeout = setTimeout(() => (foo.value = undefined), 1000);

	const options = { timeout: 50, throwOnTimeout: false };
	await expect(until(foo).toBeFalsy(options)).resolves.not.toThrowError();
	clearTimeout(timeout);
});

test('until to be falsy (throw on timeout)', async () => {
	const foo = ref<any>(true);
	const timeout = setTimeout(() => (foo.value = undefined), 1000);

	await expect(until(foo).toBeFalsy({ timeout: 50 })).rejects.toThrowError();
	expect(foo.value).toBeTruthy();
	clearTimeout(timeout);
});

test('until to be instance of', async () => {
	const foo = ref<any>(new String('bar'));
	queueMicrotask(() => (foo.value = new Date()));

	await until(foo).toBeInstanceOf(Date);
	expect(foo.value).toBeInstanceOf(Date);
});

test('until to be instance of (timeout)', async () => {
	const foo = ref<any>(new String('bar'));
	const timeout = setTimeout(() => (foo.value = new Date()), 1000);

	const options = { timeout: 50, throwOnTimeout: false };
	await expect(
		until(foo).toBeInstanceOf(Date, options)
	).resolves.not.toThrowError();
	clearTimeout(timeout);
});

test('until to be instance of (throw on timeout)', async () => {
	const foo = ref<any>(new String('bar'));
	const timeout = setTimeout(() => (foo.value = new Date()), 1000);

	await expect(
		until(foo).toBeInstanceOf(Date, { timeout: 50 })
	).rejects.toThrowError();
	expect(foo.value).toBeInstanceOf(String);
	clearTimeout(timeout);
});

test('until to be null', async () => {
	const foo = ref<any>('bar');
	queueMicrotask(() => (foo.value = null));

	await until(foo).toBeNull();
	expect(foo.value).toBeNull();
});

test('until to be null (timeout)', async () => {
	const foo = ref<any>('bar');
	const timeout = setTimeout(() => (foo.value = null), 1000);

	const options = { timeout: 50, throwOnTimeout: false };
	await expect(until(foo).toBeNull(options)).resolves.not.toThrowError();
	clearTimeout(timeout);
});

test('until to be null (throw on timeout)', async () => {
	const foo = ref<any>('bar');
	const timeout = setTimeout(() => (foo.value = null), 1000);

	await expect(until(foo).toBeNull({ timeout: 50 })).rejects.toThrowError();
	expect(foo.value).not.toBeNull();
	clearTimeout(timeout);
});

test('until to be typeof', async () => {
	const foo = ref<any>('bar');
	queueMicrotask(() => (foo.value = 123));

	await until(foo).toBeTypeOf('number');
	expect(foo.value).toBeTypeOf('number');
});

test('until to be typeof (timeout)', async () => {
	const foo = ref<any>('bar');
	const timeout = setTimeout(() => (foo.value = 123), 1000);

	const options = { timeout: 50, throwOnTimeout: false };
	await expect(
		until(foo).toBeTypeOf('number', options)
	).resolves.not.toThrowError();
	clearTimeout(timeout);
});

test('until to be typeof (throw on timeout)', async () => {
	const foo = ref<any>('bar');
	const timeout = setTimeout(() => (foo.value = 123), 1000);

	await expect(
		until(foo).toBeTypeOf('number', { timeout: 50 })
	).rejects.toThrowError();
	expect(foo.value).toBeTypeOf('string');
	clearTimeout(timeout);
});

test('until to match arbitrary condition', async () => {
	const foo = ref<any>('bar');

	queueMicrotask(() => (foo.value = 'baz'));
	await until(foo).toMatch((value) => value === 'baz');
	expect(foo.value).toBe('baz');

	queueMicrotask(() => (foo.value = new Date()));
	await until(foo).toMatch((value) => value instanceof Date);
	expect(foo.value).toBeInstanceOf(Date);

	queueMicrotask(() => (foo.value = null));
	await until(foo).toMatch((value) => value === null);
	expect(foo.value).toBeNull();

	queueMicrotask(() => (foo.value = 123));
	await until(foo).toMatch((value) => value === 123);
	expect(foo.value).toBe(123);

	queueMicrotask(() => (foo.value = undefined));
	await until(foo).toMatch((value) => value === undefined);
	expect(foo.value).toBeUndefined();
});
