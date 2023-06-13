import { watch } from '@/reactivity/effect';
import { promiseTimeout } from '@/utils/helpers';

export interface UntilOptions {
    /**
     * Milliseconds timeout for promise to resolve/reject if the condition does not meet.
     * If `0`, the promise will never timeout.
     * @default 0
     */
    timeout?: number
    /**
     * Reject the promise when timeout.
     * @default true
     */
    throwOnTimeout?: boolean
    /**
     * Reason for rejecting the promise when timeout.
     * @default 'Timeout'
     */
    timeoutReason?: string
};

export function until<T>(mechanusRef: MechanusRefOrComputedRef<T>) {
    return {
        toBe: toBe(mechanusRef),
        toBeFalsy: toBeFalsy(mechanusRef),
        toBeInstanceOf: toBeInstanceOf(mechanusRef),
        toMatch: toMatch(mechanusRef),
        toBeNull: toBeNull(mechanusRef),
        toBeTruthy: toBeTruthy(mechanusRef),
        toBeTypeOf: toBeTypeOf(mechanusRef)
    } as const;
};

function toMatch<T>(mechanusRef: MechanusRefOrComputedRef<T>) {
    return function(condition: (value: T) => boolean, options: UntilOptions = {}): Promise<void> {
        let stopWatcher: (() => void) | null = null;
        const watcher = new Promise<void>((resolve) => {
            stopWatcher = watch(mechanusRef, (newValue) => {
                if (condition(newValue)){
                    stopWatcher?.();
                    resolve();
                };
            }, { immediate: true });
        });

        if (typeof options.timeout !== 'number') options.timeout = 0;
        if (typeof options.throwOnTimeout !== 'boolean') options.throwOnTimeout = true;

        const promises: Promise<void>[] = [watcher];
        if (options.timeout > 0) {
            promises.push(
                promiseTimeout(options.timeout, options.throwOnTimeout, options.timeoutReason)
                    .finally(() => stopWatcher?.())
            );
        };

        return Promise.race(promises);
    };
};

function toBe<T>(mechanusRef: MechanusRefOrComputedRef<T>) {
    return function(expectedValue: T, options: UntilOptions = {}) {
        return toMatch(mechanusRef)((value) => value === expectedValue, options);
    };
};

function toBeFalsy<T>(mechanusRef: MechanusRefOrComputedRef<T>) {
    return function(options: UntilOptions = {}) {
        return toMatch(mechanusRef)((value) => !Boolean(value), options);
    };
};

function toBeInstanceOf<T>(mechanusRef: MechanusRefOrComputedRef<T>) {
    return function(expectedClass: new (...args: any[]) => T, options: UntilOptions = {}) {
        return toMatch(mechanusRef)((value) => value instanceof expectedClass, options);
    };
};

function toBeNull<T>(mechanusRef: MechanusRefOrComputedRef<T>) {
    return function(options: UntilOptions = {}) {
        return toMatch(mechanusRef)((value) => value === null, options);
    };
};

function toBeTruthy<T>(mechanusRef: MechanusRefOrComputedRef<T>) {
    return function(options: UntilOptions = {}) {
        return toMatch(mechanusRef)((value) => Boolean(value), options);
    };
};

function toBeTypeOf<T>(mechanusRef: MechanusRefOrComputedRef<T>) {
    return function(
        expectedType: 'bigint' | 'boolean' | 'function' | 'number' | 'object' | 'string' | 'symbol' | 'undefined',
        options: UntilOptions = {}
    ) {
        return toMatch(mechanusRef)((value) => typeof value === expectedType, options);
    };
};