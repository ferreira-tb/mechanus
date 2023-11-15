import {
  readonly,
  ref,
  watch,
  type MechanusRefOrComputedRef,
  type ReadonlyMechanusRef
} from '../reactivity';

export interface ComputedAsyncOptions {
  /**
   * Whether to lazy load the promise.
   * @default false
   */
  lazy?: boolean;
  /**
   * Error handler for the promise.
   * If not provided, the error will be thrown.
   */
  onError?: (error: unknown) => void;
}

export function computedAsync<T>(
  mechanusRef: MechanusRefOrComputedRef,
  initialValue: T,
  getter: () => Promise<T>,
  options?: ComputedAsyncOptions
): ReadonlyMechanusRef<T> {
  const asyncRef = ref(initialValue);

  watch(
    mechanusRef,
    async () => {
      try {
        const value = await getter();
        asyncRef.value = value;
      } catch (err) {
        if (options?.onError) options.onError(err);
        else throw err;
      }
    },
    { immediate: !options?.lazy }
  );

  return readonly(asyncRef);
}
