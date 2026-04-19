# @wicle/mutex

Async `Mutex` and `Semaphore` for Node.js and browsers, written in TypeScript.

- Zero dependencies
- Promise-based, works with `async`/`await`
- POSIX-style naming (`wait`, `post`, `lock`, `unlock`) with ergonomic aliases (`acquire`, `release`, `withLock`, …)
- Timeout variants for every blocking operation

## Installation

```bash
npm add @wicle/mutex
yarn add @wicle/mutex
pnpm add @wicle/mutex
```

## Quick start

### Mutex — exclusive access

The safest pattern is `withLock`, which releases the lock automatically even if the callback throws.

```ts
import { Mutex } from '@wicle/mutex'

const mtx = new Mutex()
let counter = 0

// Launch 100 concurrent "threads" — only one runs inside withLock at a time.
await Promise.all(
    Array.from({ length: 100 }, () =>
        mtx.withLock(async () => {
            const val = counter
            await someAsyncWork()
            counter = val + 1  // safe: no other thread can be here simultaneously
        })
    )
)
```

Manual lock / unlock:

```ts
await mtx.lock()
try {
    // critical section
} finally {
    mtx.unlock()
}
```

### Semaphore — resource counting and signaling

**Resource counting** (initial value > 0): limits the number of concurrent operations.

```ts
import { Semaphore } from '@wicle/mutex'

const sem = new Semaphore(3)  // allow up to 3 concurrent operations

async function fetchWithLimit(url: string) {
    return sem.withAcquire(async () => {
        const res = await fetch(url)
        return res.json()
    })
}
```

**Signaling** (initial value 0): one coroutine waits, another signals.

```ts
const ready = new Semaphore(0)  // starts blocked

// Consumer waits for the producer to signal.
async function consumer() {
    await ready.wait()
    console.log('producer finished, processing now')
}

// Producer signals when done.
async function producer() {
    await doWork()
    ready.post()
}

await Promise.all([consumer(), producer()])
```

## API

### `Semaphore`

```ts
new Semaphore(value?: number)
```

Creates a semaphore with `value` available resources (default `0`). A value of `0` is the signaling pattern — the semaphore starts blocked and a caller must `post()` before `wait()` can proceed. Use a positive value for resource counting.

---

#### `sem.wait()` → `Promise<void>`

Acquires one resource, waiting until one is available. POSIX `sem_wait`.

```ts
await sem.wait()
```

#### `sem.tryWait()` → `boolean`

Acquires one resource without waiting. Returns `true` if acquired, `false` if none are available. POSIX `sem_trywait`.

#### `sem.waitFor(timeout)` → `Promise<boolean>`

Acquires one resource, waiting up to `timeout` milliseconds. Returns `true` if acquired, `false` on timeout.

```ts
if (await sem.waitFor(500)) {
    // acquired within 500 ms
} else {
    // timed out
}
```

#### `sem.post()` → `void`

Releases one resource, waking the oldest waiter if any. POSIX `sem_post`.

#### `sem.value` → `number`

The current resource count — number of available resources, or pending signals in the signaling pattern.

#### `sem.maxValue` → `number`

The initial resource count passed to the constructor. Reflects the pool size for the resource-counting pattern, or `0` for the signaling pattern.

#### `sem.withAcquire(fn)` → `Promise<T>`

Acquires one resource, runs `fn`, then releases it — even if `fn` throws. Recommended over manual `acquire`/`release`.

> Only use `withAcquire` with a positive initial value. With `value = 0` (signaling pattern), `acquire()` will block until someone calls `post()`, and there is no automatic signal to unblock it.

```ts
const result = await sem.withAcquire(async () => {
    return doWork()
})
```

---

**Aliases** — identical behavior, alternative naming:

| Alias | Equivalent |
|---|---|
| `sem.acquire()` | `sem.wait()` |
| `sem.tryAcquire()` | `sem.tryWait()` |
| `sem.acquireFor(timeout)` | `sem.waitFor(timeout)` |
| `sem.release()` | `sem.post()` |

---

### `Mutex`

A binary semaphore with an ownership guard. Equivalent to `new Semaphore(1)` but with additional safety: `unlock()` throws if the mutex is not currently locked.

> Lock ownership is not enforced — any caller can release the lock.

```ts
new Mutex()
```

---

#### `mtx.lock()` → `Promise<void>`

Acquires the lock, waiting until it is available.

#### `mtx.tryLock()` → `boolean`

Acquires the lock without waiting. Returns `true` if acquired, `false` if already locked.

#### `mtx.lockFor(timeout)` → `Promise<boolean>`

Acquires the lock, waiting up to `timeout` milliseconds. Returns `true` if acquired, `false` on timeout.

```ts
if (await mtx.lockFor(500)) {
    try {
        // critical section
    } finally {
        mtx.unlock()
    }
} else {
    // could not acquire within 500 ms
}
```

#### `mtx.unlock()` → `void`

Releases the lock. **Throws** if the mutex is not currently locked — use this to catch double-unlock bugs early.

#### `mtx.locked` → `boolean`

`true` while the mutex is held.

#### `mtx.withLock(fn)` → `Promise<T>`

Acquires the lock, runs `fn`, then releases — even if `fn` throws. Recommended over manual `lock`/`unlock`.

```ts
const result = await mtx.withLock(async () => {
    return doExclusiveWork()
})
```

## License

MIT © 2024 Robin Nam
