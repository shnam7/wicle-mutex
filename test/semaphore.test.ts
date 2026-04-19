import {describe, expect, it} from 'vitest'
import {Semaphore} from '../src/index.js'

const producerConsumer = async (maxProduce = 100, handshake = false): Promise<boolean> => {
    let consumerSum = 0
    let expectedSum = 0
    let sharedMem = 0
    const semReader = handshake ? new Semaphore(0) : undefined
    const semWriter = handshake ? new Semaphore(0) : undefined

    const producer = async () => {
        let count = 0
        while (++count <= maxProduce) {
            sharedMem = count
            expectedSum += count
            semWriter?.post()
            // eslint-disable-next-line no-await-in-loop
            await semReader?.wait()
        }
    }

    const consumer = async () => {
        let count = 0
        while (++count <= maxProduce) {
            // eslint-disable-next-line no-await-in-loop
            await semWriter?.wait()
            consumerSum += sharedMem
            semReader?.post()
        }
    }

    await Promise.all([producer(), consumer()])
    return consumerSum === expectedSum
}

describe('Semaphore', () => {
    describe('tryAcquire()', () => {
        it('fails when no resource is available, succeeds after release', () => {
            const sem = new Semaphore()
            expect(sem.tryAcquire()).toBe(false)
            sem.release()
            expect(sem.tryAcquire()).toBe(true)
            expect(sem.value).toBe(0)
        })
    })

    describe('tryWait()', () => {
        it('drains all N initial resources then fails, succeeds again after one release', () => {
            const n = 110
            const sem = new Semaphore(n)
            for (let i = 0; i < n; ++i) expect(sem.tryWait()).toBe(true)
            expect(sem.value).toBe(0)
            expect(sem.tryWait()).toBe(false)
            sem.release()
            expect(sem.tryWait()).toBe(true)
        })
    })

    describe('waitFor()', () => {
        it('returns true immediately when a resource is available', async () => {
            const sem = new Semaphore(1)
            expect(await sem.waitFor(50)).toBe(true)
            expect(sem.value).toBe(0)
        })

        it('returns false on timeout when no resource is available', async () => {
            const sem = new Semaphore(0)
            expect(await sem.waitFor(30)).toBe(false)
            expect(sem.value).toBe(0)
        })

        it('acquires when a resource is posted before the timeout', async () => {
            const sem = new Semaphore(0)
            setTimeout(() => {
                sem.post()
            }, 10)
            expect(await sem.waitFor(200)).toBe(true)
        })
    })

    describe('acquire() and acquireFor()', () => {
        it('acquire() waits for a resource like wait()', async () => {
            const sem = new Semaphore(1)
            await sem.acquire()
            expect(sem.value).toBe(0)
        })

        it('acquireFor() times out like waitFor()', async () => {
            const sem = new Semaphore(0)
            expect(await sem.acquireFor(30)).toBe(false)
        })
    })

    describe('maxValue', () => {
        it('reflects the initial constructor value', () => {
            expect(new Semaphore().maxValue).toBe(0)
            expect(new Semaphore(5).maxValue).toBe(5)
        })

        it('does not change after post() or wait()', async () => {
            const sem = new Semaphore(2)
            await sem.wait()
            sem.post()
            sem.post()
            expect(sem.maxValue).toBe(2)
        })
    })

    describe('withAcquire()', () => {
        it('releases the resource even when the callback throws', async () => {
            const sem = new Semaphore(1)
            await expect(sem.withAcquire(() => {
                throw new Error('fail')
            })).rejects.toThrow('fail')
            expect(sem.value).toBe(1)
        })
    })

    describe('Producer/Consumer synchronization', () => {
        it('consumer sum mismatches without handshaking', async () => {
            expect(await producerConsumer(100, false)).toBe(false)
        })

        it('consumer sum matches with semaphore handshaking', async () => {
            expect(await producerConsumer(100, true)).toBe(true)
        })
    })
})
