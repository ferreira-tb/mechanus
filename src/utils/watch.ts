import {
  watch,
  type WatchCallback,
  type WatchOptions,
  type WatchSource,
  type WatchStopHandle
} from '../reactivity';

export function watchAsync<T, Immediate extends Readonly<boolean> = false>(
  source: WatchSource<T>,
  callback: WatchCallback<T, Immediate extends true ? T | undefined : T>,
  options: Omit<WatchOptions<Immediate>, 'sync'> = {}
): WatchStopHandle {
  return watch(source, callback, { ...options, sync: false });
}

/** Same as `watch` but triggers the callback immediately on watcher creation. */
export function watchImmediate<T>(
  source: WatchSource<T>,
  callback: WatchCallback<T, T | undefined>,
  options: Omit<WatchOptions<true>, 'immediate'> = {}
): WatchStopHandle {
  return watch(source, callback, { ...options, immediate: true });
}

/** Same as `watch` but only run the callback once. */
export function watchOnce<T, Immediate extends Readonly<boolean> = false>(
  source: WatchSource<T>,
  callback: WatchCallback<T, Immediate extends true ? T | undefined : T>,
  options: Omit<WatchOptions<Immediate>, 'once'> = {}
): WatchStopHandle {
  return watch(source, callback, { ...options, once: true });
}

/** Shorthand for watching value to be truthy. */
export function whenever<T, Immediate extends Readonly<boolean> = false>(
  source: WatchSource<T | false | null | undefined>,
  callback: WatchCallback<T, unknown>,
  options: WatchOptions<Immediate> = {}
): WatchStopHandle {
  return watch(
    source,
    (value, oldValue) => {
      if (value) callback(value, oldValue);
    },
    options
  );
}

/** Shorthand for asynchronously watching value to be truthy. */
export function wheneverAsync<T, Immediate extends Readonly<boolean> = false>(
  source: WatchSource<T | false | null | undefined>,
  callback: WatchCallback<T, unknown>,
  options: Omit<WatchOptions<Immediate>, 'sync'> = {}
): WatchStopHandle {
  return whenever(source, callback, { ...options, sync: false });
}

/** Shorthand for immediately watching value to be truthy. */
export function wheneverImmediate<T>(
  source: WatchSource<T | false | null | undefined>,
  callback: WatchCallback<T, unknown>,
  options: Omit<WatchOptions<true>, 'immediate'> = {}
): WatchStopHandle {
  return whenever(source, callback, { ...options, immediate: true });
}
