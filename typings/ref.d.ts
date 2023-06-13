type UnwrapRef<T> = T extends import('@/reactivity/ref').MechanusRef<infer R> ? R : T;
type UnwrapReadonlyRef<T> = T extends ReadonlyMechanusRef<infer R> ? R : T;
type UnwrapComputed<T> = T extends import('@/reactivity/ref').MechanusComputedRef<infer U> ? U : T;

type MechanusRefOrComputedRef<T = any> =
    | import('@/reactivity/ref').MechanusRef<T>
    | import('@/reactivity/ref').MechanusComputedRef<T>
    | ReadonlyMechanusRef<T>;

type ReadonlyMechanusRef<T = any> = Omit<import('@/reactivity/ref').MechanusRef<T>, 'value'> & {
    readonly value: T;
};