import crypto from 'node:crypto'
import {beforeAll, describe, expect, it} from 'vitest'
import {Mutex} from '../src/index.js'

const delay = async (ms: number) => new Promise<void>(resolve => {
    setTimeout(resolve, ms)
})

const criticalSectionTest = async (useMutex: boolean): Promise<boolean> => {
    let threadsInSection = 0
    let collisions = 0
    const mutex = useMutex ? new Mutex() : undefined

    const thread = async () => {
        await mutex?.lock()
        if (++threadsInSection !== 1) ++collisions
        await delay(0) // all started threads will have incremented before any decrements
        --threadsInSection
        mutex?.unlock()
    }

    await Promise.all(Array.from({length: 100}, thread))
    return collisions === 0
}

// Extracted to module scope to keep describe.concurrent nesting within 4 levels.
const logUnderLock = async (mtx: Mutex, n: number, log: number[]) =>
    mtx.withLock(async () => {
        log.push(n)
        await delay(1)
        log.push(n)
    })

describe.concurrent('Mutex', () => {
    describe('tryLock() and locked', () => {
        it('returns true when free, false when already locked, tracked by locked getter', () => {
            const mtx = new Mutex()
            expect(mtx.locked).toBe(false)
            expect(mtx.tryLock()).toBe(true)
            expect(mtx.locked).toBe(true)
            expect(mtx.tryLock()).toBe(false)
        })
    })

    describe('unlock()', () => {
        it('throws when called on an unlocked mutex', () => {
            expect(() => {
                new Mutex().unlock()
            }).toThrow()
        })
    })

    describe('withLock()', () => {
        it('releases the lock even when the callback throws', async () => {
            const mtx = new Mutex()
            await expect(mtx.withLock(async () => {
                throw new Error('boom')
            })).rejects.toThrow('boom')
            expect(mtx.locked).toBe(false)
        })

        it('provides exclusive access', async () => {
            const mtx = new Mutex()
            const log: number[] = []
            await Promise.all([1, 2, 3].map(async n => logUnderLock(mtx, n, log)))
            for (let i = 0; i < log.length; i += 2) {
                expect(log[i]).toBe(log[i + 1])
            }
        })
    })

    describe('lockFor()', () => {
        it('returns true and acquires when the mutex is free', async () => {
            const mtx = new Mutex()
            expect(await mtx.lockFor(50)).toBe(true)
            expect(mtx.locked).toBe(true)
        })

        it('returns false on timeout when the mutex is held', async () => {
            const mtx = new Mutex()
            mtx.tryLock()
            expect(await mtx.lockFor(30)).toBe(false)
            expect(mtx.locked).toBe(true)
        })

        it('acquires when the mutex is released before the timeout', async () => {
            const mtx = new Mutex()
            mtx.tryLock()
            setTimeout(() => {
                mtx.unlock()
            }, 10)
            expect(await mtx.lockFor(200)).toBe(true)
        })
    })

    describe('critical section', () => {
        it('collisions occur without mutex', async () => {
            expect(await criticalSectionTest(false)).toBe(false)
        })

        it('no collisions with mutex', async () => {
            expect(await criticalSectionTest(true)).toBe(true)
        })
    })

    describe('shared memory under concurrent access', () => {
        let results: string[]
        let sent: string[]

        beforeAll(async () => {
            const mtx = new Mutex()
            let sharedMem = ''
            sent = Array.from({length: 100}, () => crypto.randomBytes(4).toString('hex'))
            results = await Promise.all(sent.map(async msg => {
                await mtx.lock()
                sharedMem = msg
                await delay(Math.random() * 10)
                const received = sharedMem
                mtx.unlock()
                return received
            }))
        })

        it('every received value was a sent value', () => {
            for (const r of results) expect(sent.includes(r)).toBe(true)
        })

        it('every sent value was received', () => {
            for (const s of sent) expect(results.includes(s)).toBe(true)
        })
    })
})
