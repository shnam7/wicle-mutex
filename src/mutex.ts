import {Semaphore} from './semaphore.js'

export class Mutex {
    private readonly _sem = new Semaphore(1)

    /**
     * Acquires the lock, waiting until it is available.
     * Lock ownership is not enforced — any caller may release it.
     */
    async lock(): Promise<void> {
        return this._sem.acquire()
    }

    /**
     * Tries to acquire the lock without waiting.
     *
     * @returns true if acquired, false if already locked.
     */
    tryLock(): boolean {
        return this._sem.tryAcquire()
    }

    /**
     * Acquires the lock, waiting up to `timeout` ms.
     *
     * @param timeout Milliseconds to wait before giving up.
     * @returns true if acquired, false on timeout.
     */
    async lockFor(timeout: number): Promise<boolean> {
        return this._sem.waitFor(timeout)
    }

    /**
     * Releases the lock.
     *
     * @throws if the mutex is not currently locked.
     */
    unlock(): void {
        if (!this.locked) throw new Error('Mutex is not locked')
        this._sem.release()
    }

    /** true while the mutex is held. */
    get locked(): boolean {
        return this._sem.value === 0
    }

    /**
     * Acquires the lock, runs `fn`, then releases — even if `fn` throws.
     */
    async withLock<T>(fn: () => T | PromiseLike<T>): Promise<T> {
        await this.lock()
        try {
            return await fn()
        } finally {
            this.unlock()
        }
    }
}
