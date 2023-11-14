# Mechanus

Mechanus is a very simple and unpretentious package for achieving reactive state management in any javascript environment. It is inspired by the outstanding [Vue.js](https://vuejs.org/guide/essentials/reactivity-fundamentals.html#ref) reactive system.

## Installation

```bash
npm install mechanus
```

## Usage

```typescript
import { computed, ref, watch } from 'mechanus';

// `counter` is now a reactive object.
const counter = ref(2);
// Its value can be accessed with `counter.value`.
console.log(counter.value); // 2

// When `counter` is updated, `double` will be updated as well.
// Different from Vue.js, we must explicitly pass an array containing the reactive objects.
const double = computed([counter], () => counter.value * 2);
// As with `counter`, `double`'s value can be accessed with `double.value`.
console.log(double.value); // 4

// We can subscribe to changes in `counter` (or even `double`).
watch(counter, (newValue) => {
	console.log(`The counter is now ${newValue}`);
});

// Updating `counter` will trigger the watcher.
counter.value = 3;
// The console will log: "The counter is now 3"
// And, of course, `double` will be updated as well.
```

## Stores

Stores are objects that contain reactive properties.

```typescript
import { Mechanus, computed, ref, storeToRefs } from 'mechanus';

const mechanus = new Mechanus();

const usePlayerStore = mechanus.define('player-store', () => {
	const players = ref(['John', 'Mary', 'Peter']);
	const amount = computed([players], () => players.value.length);

	return { players, amount };
});

// We can get the reactive objects from the store with `storeToRefs`.
const playerStore = usePlayerStore();
const { amount } = storeToRefs(playerStore);
console.log(amount.value); // 3
```

## Watchers

Watchers are functions that are called whenever a reactive object is updated. They are created with the `watch` function, which takes two arguments: the reactive object to watch, and the function to call when the object is updated. The function will be called with the new value of the reactive object as its first argument.

Optionally, a third argument can be passed to `watch`: a object with the following properties:

```typescript
interface WatchOptions {
	// Force the watcher to be called immediately after creation.
	immediate?: boolean;
	// Watcher will be called only once, and then it will be stopped.
	once?: boolean;
	// Synchronously trigger the watcher after the reactive object is updated.
	sync?: boolean;
}
```

The `watch` function returns a function that can be called to stop the watcher.

```typescript
const stop = watch(counter, (newValue) => {
	console.log(`The counter is now ${newValue}`);
});

// Stop the watcher.
stop();
counter.value = 4;
// Nothing happens.
```

We can use some shorthand functions to create watchers:

```typescript
import { watchImmediate, watchOnce } from 'mechanus';

// Same as calling `watch` with `{ immediate: true }`.
watchImmediate(counter, (newValue) => {
	console.log(`The counter is now ${newValue}`);
});

// Same as calling `watch` with `{ once: true }`.
watchOnce(counter, (newValue) => {
	console.log(`The counter is now ${newValue}`);
});
```

## Until

The `until` function returns a promise that resolves when the value of a reactive object satisfies a condition, or rejects if the condition is not satisfied before a timeout.

```typescript
import { until } from 'mechanus';

interface UntilOptions {
	// The timeout in milliseconds.
	timeout?: number;
	// If `true`, the promise will reject if the condition is not satisfied before the timeout.
	throwOnTimeout?: boolean;
	// Reason for the rejection.
	timeoutReason?: string;
}

const counter = ref(0);
queueMicrotask(() => {
	counter.value = 1;
});

// Wait until `counter` is equal to 1.
until(counter)
	.toBe(1)
	.then(() => {
		console.log('Counter is now 1');
	});

// We can also set a timeout.
until(counter)
	.toBe(1, { timeout: 1000 })
	.then(
		() => console.log('Counter is now 1'),
		() => console.log('Counter is not 1 after 1 second')
	);

// By default, the promise will reject if the condition is not satisfied before the timeout.
// We can change this behavior by passing `{ throwOnTimeout: false }`.
until(counter)
	.toBe(1, { timeout: 1000, throwOnTimeout: false })
	.then(
		() => console.log('Counter is now 1'),
		() => console.log('What am I doing here?')
	);
```
