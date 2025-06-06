// ref: https://github.com/pbardov/es6-mutex

export class Semaphore {
    protected _waitQ: Array<() => void> = []
    protected _value = 0 // # of currently allowed accesses

    constructor(value = 0) {
        this._value = value
    }


    /**
     * POSIX semaphore interface for sem_wait().
     *
     * @returns Promise waiting for the semaphore to be signaled.
     */
    async wait(): Promise<void> {
        if (this._value > 0) {
            --this._value
            return
        }

        return new Promise<void>(resolve => {
            this._waitQ.push(() => {
                --this._value
                resolve()
            })
        })
    }

    /**
     * POSIX semaphore interface for sem_trywait().
     * Check if tghe semaphore is signaled without waiting.
     *
     * @returns true if the semaphoire is in signaled state, or false
     */
    tryWait(): boolean {
        if (this._value <= 0) return false
        --this._value
        return true
    }

    /**
     * POSIX semaphore interface for sem_post(). Alias fore release()
     */
    post(): void {
        ++this._value
        if (this._waitQ.length > 0) {
            const resolver = this._waitQ.shift()
            if (resolver) resolver()
        }
    }

    /**
     * @returns semapohore value, whichi means resouce count currently available or signaled count.
     */
    get value(): number {
        return this._value
    }

    /**
     * Aquire semaphore resource. Alias to sem.wait().
     *
     * @returns Promise waiting for sempahore resorece allocation.
     */
    async acquire(): Promise<void> {
        return this.wait()
    }

    /**
     * Try aquiring semaphore resource. returns immediately if the access not available.
     * Alias to sem.tryWait().
     *
     * @returns true if the access aquired, or false.
     */
    tryAcquire(): boolean {
        return this.tryWait()
    }

    /**
     * Release semaphore resource.
     * Alias to sem.post().
     */
    release(): void {
        this.post();
    }
}
