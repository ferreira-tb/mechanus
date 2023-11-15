import { expect, test } from 'vitest';
import {
  computed,
  isReadonly,
  readonly,
  ref,
  isRef,
  unref,
  MechanusRef
} from '../src/reactivity/ref';
import { watch } from '../src/reactivity/effect';

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

  const bar: unknown = { value: 'baz' };
  expect(isRef(bar)).toBe(false);
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

test('isReadonly', () => {
  const foo = ref('bar');
  const readonlyFoo = readonly(foo);
  const computedBar = computed([foo], () => foo.value + 'qux');

  expect(isReadonly(readonlyFoo)).toBe(true);
  expect(isReadonly(computedBar)).toBe(true);
  expect(isReadonly(foo)).toBe(false);
  expect(isReadonly('baz')).toBe(false);
});

test('unref readonly ref', () => {
  const foo = ref('bar');
  const readonlyFoo = readonly(foo);
  expect(readonlyFoo.value).toBe('bar');
  expect(unref(readonlyFoo)).toBe('bar');
  expect(unref('baz')).toBe('baz');
});
