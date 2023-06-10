import { expect, test } from 'vitest';
import { ref } from '@/reactivity/ref';
import { watch, watchImmediate, watchOnce } from '@/reactivity/effect';

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