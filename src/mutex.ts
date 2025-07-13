/**
 * ref: https://github.com/pbardov/es6-mutex
 */

import {Semaphore} from './semaphore.js'

export class Mutex {
    protected _sem = new Semaphore(1)

    /**
     * Get access to the exclusive resource.
     *
     * @returns Promise to get the access the resource (lock).
     */
    async lock(): Promise<void> {
        return this._sem.acquire()
    }

    /**
     * Try to get access to the exclusive resource without waiting.
     *
     * @returns true if the aquired, or false.
     */
    tryLock(): boolean {
        return this._sem.tryAcquire()
    }

    /**
     * Unlock the exclusive resource.
     */
    unlock(): void {
        this._sem.release()
    }
}
