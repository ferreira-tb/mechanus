import { unref, isRef } from '@/reactivity/ref';

export function reactive<T extends { [K in string]: any }>(raw: T): T {
    return new Proxy(raw, {
        get(target, key) {
            if (typeof key === 'string' && key in target) {
                const item = Reflect.get(target, key);
                return unref(item);
            };

            throw new TypeError(`Reactive object does not have property "${String(key)}".`);
        },
        set(target, key, value) {
            if (typeof key === 'string' && key in target) {
                const item = Reflect.get(target, key);
                if (isRef(item)) {
                    item.value = value;
                    return true;
                } else {
                    throw new TypeError(`Cannot set value of non-ref property "${key}".`);
                };
            };

            throw new TypeError(`Reactive object does not have property "${String(key)}".`);
        }
    });
};