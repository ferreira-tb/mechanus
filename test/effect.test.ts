import { expect, test } from 'vitest';
import { ref, watch } from '@/index';

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

test('unwatch', () => {
    const foo = ref('bar');
    let count = 0;

    const unwatch = watch(foo, () => count++);
    expect(count).toBe(0);

    foo.value = 'baz';
    expect(count).toBe(1);

    foo.value = 'qux';
    expect(count).toBe(2);

    unwatch();
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