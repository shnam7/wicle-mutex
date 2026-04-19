export class Semaphore {
    private readonly _waitQ: Array<() => void> = []
    private readonly _maxValue: number
    private _value: number

    /**
     * @param value Initial resource count. The default of 0 is the signaling (event) pattern;
     *              use a positive value for resource-counting.
     */
    constructor(value = 0) {
        this._maxValue = value
        this._value = value
    }

    /**
     * POSIX sem_wait(). Acquires one resource, waiting if none are available.
     */
    async wait(): Promise<void> {
        if (this._value > 0) {
            --this._value
            return
        }

        return new Promise<void>(resolve => {
            this._waitQ.push(resolve)
        })
    }

    /**
     * POSIX sem_trywait(). Acquires one resource without waiting.
     *
     * @returns true if acquired, false if no resource is available.
     */
    tryWait(): boolean {
        if (this._value <= 0) return false
        --this._value
        return true
    }

    /**
     * Acquires one resource, waiting up to `timeout` ms.
     *
     * @param timeout Milliseconds to wait before giving up.
     * @returns true if acquired, false on timeout.
     */
    async waitFor(timeout: number): Promise<boolean> {
        if (this._value > 0) {
            --this._value
            return true
        }

        return new Promise<boolean>(resolve => {
            let acquired = false
            const waiter = () => {
                acquired = true
                resolve(true)
            }

            this._waitQ.push(waiter)
            setTimeout(() => {
                if (acquired) return
                const idx = this._waitQ.indexOf(waiter)
                if (idx !== -1) this._waitQ.splice(idx, 1)
                resolve(false)
            }, timeout)
        })
    }

    /**
     * POSIX sem_post(). Releases one resource, waking the oldest waiter if any.
     */
    post(): void {
        const next = this._waitQ.shift()
        if (next) {
            next()
        } else {
            ++this._value
        }
    }

    /**
     * Current resource count — available resources, or pending signals when using the signaling pattern.
     */
    get value(): number {
        return this._value
    }

    /**
     * The initial resource count passed to the constructor.
     * For the signaling pattern this is 0; for resource counting it is the pool size.
     */
    get maxValue(): number {
        return this._maxValue
    }

    /** Alias for {@link wait}. */
    async acquire(): Promise<void> {
        return this.wait()
    }

    /** Alias for {@link tryWait}. */
    tryAcquire(): boolean {
        return this.tryWait()
    }

    /** Alias for {@link waitFor}. */
    async acquireFor(timeout: number): Promise<boolean> {
        return this.waitFor(timeout)
    }

    /** Alias for {@link post}. */
    release(): void {
        this.post()
    }

    /**
     * Acquires the semaphore, runs `fn`, then releases — even if `fn` throws.
     */
    async withAcquire<T>(fn: () => T | PromiseLike<T>): Promise<T> {
        await this.wait()
        try {
            return await fn()
        } finally {
            this.post()
        }
    }
}
