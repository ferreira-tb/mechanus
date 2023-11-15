import { expect, test } from 'vitest';
import { ref } from '../src/reactivity/ref';
import { watch } from '../src/reactivity/effect';
import {
  watchAsync,
  watchImmediate,
  watchOnce,
  whenever,
  wheneverAsync,
  wheneverImmediate
} from '../src/utils';

test('watch', () => {
  const foo = ref('bar');
  let count = 0;

  watch(foo, () => count++);
  expect(count).toBe(0);

  foo.value = 'baz';
  expect(count).toBe(1);

  foo.value = 'qux';
  expect(count).toBe(2);
});

test('stop watch', () => {
  const foo = ref('bar');
  let count = 0;

  const stop = watch(foo, () => count++);
  expect(count).toBe(0);

  foo.value = 'baz';
  expect(count).toBe(1);

  foo.value = 'qux';
  expect(count).toBe(2);

  stop();
  foo.value = 'quux';
  expect(count).toBe(2);
});

test('watch old value', () => {
  const foo = ref('bar');
  let oldValue = '';

  watch(foo, (_value, old) => (oldValue = old));
  expect(oldValue).toBe('');

  foo.value = 'baz';
  expect(oldValue).toBe('bar');

  foo.value = 'qux';
  expect(oldValue).toBe('baz');
});

test('watch immediate', () => {
  const foo = ref('bar');
  let count = 0;

  watchImmediate(foo, () => count++);
  expect(count).toBe(1);

  foo.value = 'baz';
  expect(count).toBe(2);

  foo.value = 'qux';
  expect(count).toBe(3);
});

test('watch once', () => {
  const foo = ref('bar');
  let count = 0;

  watchOnce(foo, () => count++);
  expect(count).toBe(0);

  foo.value = 'baz';
  expect(count).toBe(1);

  foo.value = 'qux';
  expect(count).toBe(1);
});

test('watch async', async () => {
  const foo = ref('bar');
  let count = 0;

  watchAsync(foo, () => count++);
  expect(count).toBe(0);

  foo.value = 'baz';
  expect(count).toBe(0);

  await Promise.resolve();
  expect(count).toBe(1);

  foo.value = 'qux';
  expect(count).toBe(1);

  await Promise.resolve();
  expect(count).toBe(2);
});

test('watch async (using timeout to check)', async () => {
  const foo = ref('bar');
  let count = 0;

  watchAsync(foo, () => count++);
  expect(count).toBe(0);

  foo.value = 'baz';
  expect(count).toBe(0);

  await new Promise((resolve) => setTimeout(resolve));
  expect(count).toBe(1);

  foo.value = 'qux';
  expect(count).toBe(1);

  await new Promise((resolve) => setTimeout(resolve));
  expect(count).toBe(2);
});

test('multiple watch async', async () => {
  const foo = ref('bar');
  let count = 0;

  watchAsync(foo, () => count++);
  watchAsync(foo, () => count++);
  watchAsync(foo, () => count++);
  expect(count).toBe(0);

  foo.value = 'baz';
  expect(count).toBe(0);

  await Promise.resolve();
  expect(count).toBe(3);

  foo.value = 'qux';
  expect(count).toBe(3);

  await Promise.resolve();
  expect(count).toBe(6);
});

test('whenever', () => {
  const foo = ref<boolean | null | string>(false);
  let count = 0;

  whenever(foo, (w) => {
    expect(w).toBeTruthy();
    count++;
  });

  expect(count).toBe(0);

  foo.value = true;
  expect(count).toBe(1);

  foo.value = false;
  expect(count).toBe(1);

  foo.value = true;
  expect(count).toBe(2);
});

test('whenever immediate', () => {
  const foo = ref<boolean | null | string>(false);
  let count = 0;

  wheneverImmediate(foo, (w) => {
    expect(w).toBeTruthy();
    count++;
  });

  expect(count).toBe(0);

  foo.value = true;
  expect(count).toBe(1);

  foo.value = false;
  expect(count).toBe(1);

  foo.value = true;
  expect(count).toBe(2);
});

test('whenever immediate (initial value is truthy)', () => {
  const foo = ref<boolean | null | string>(true);
  let count = 0;

  wheneverImmediate(foo, (w) => {
    expect(w).toBeTruthy();
    count++;
  });

  expect(count).toBe(1);

  foo.value = false;
  expect(count).toBe(1);

  foo.value = true;
  expect(count).toBe(2);
});

test('whenever async', async () => {
  const foo = ref<boolean | null | string>(false);
  let count = 0;

  wheneverAsync(foo, (w) => {
    expect(w).toBeTruthy();
    count++;
  });

  expect(count).toBe(0);

  foo.value = true;
  expect(count).toBe(0);

  await Promise.resolve();
  expect(count).toBe(1);

  foo.value = false;
  expect(count).toBe(1);

  foo.value = true;
  expect(count).toBe(1);

  await Promise.resolve();
  expect(count).toBe(2);
});
