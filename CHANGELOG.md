# @wicle/mutex

## 0.10.0

### New
- `Mutex.withLock<T>(fn)` — acquires, runs `fn`, releases in `finally`
- `Mutex.lockFor(timeout)` — timed acquire; returns `false` on timeout
- `Mutex.locked` getter
- `Semaphore.withAcquire<T>(fn)` — acquires, runs `fn`, releases in `finally`
- `Semaphore.waitFor(timeout)` / `acquireFor(timeout)` — timed acquire; returns `false` on timeout
- `Semaphore.maxValue` getter

### Fixed
- `Semaphore.post()` now hands resources directly to waiters instead of transiently inflating `value`
- `Mutex.unlock()` now throws when called on an unlocked mutex

### Breaking
- `Semaphore._waitQ`, `Semaphore._value`, and `Mutex._sem` changed from `protected` to `private`
- Build outputs renamed to `index.mjs` / `index.cjs` / `index.d.mts` / `index.d.cts` (tsdown migration)

## 0.9.0

Initial release.

### API
- `Semaphore` — `wait()`, `tryWait()`, `post()`, `release()`, `acquire()`, `tryAcquire()`, `value`
- `Mutex` — `lock()`, `tryLock()`, `unlock()`
