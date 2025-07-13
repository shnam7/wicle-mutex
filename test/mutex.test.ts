import crypto from 'node:crypto'
import { describe, expect, it, test } from 'vitest'
import { Mutex } from '../src/index.js'

export const delay = async (ms: number) => new Promise(resolve => {setTimeout(resolve, ms)})

/**
 * Critical section test
 * There should be only one thread in critical section.
 * ref: https://github.com/orimay/mutex-ts
 *
 * @param {useMutex} flag to enable mutex
 * @returns true on success, or false
 */
const critical_section_test = async ({ useMutex = false } = {}) => {
    let threads_in_crit_section = 0
    let collision_count = 0
    const mutex = useMutex ? new Mutex() : undefined

    const thread = async () => {
        await mutex?.lock()
        ++threads_in_crit_section
        if (threads_in_crit_section !== 1) ++collision_count
        await delay(Math.random() * 10) // give a chance to other thread to increment critAccess
        --threads_in_crit_section
        mutex?.unlock()
    }

    const threads: Array<Promise<unknown>> = []
    for (let i = 0; i < 100; ++i) {
        threads.push(thread())
    }

    await Promise.all(threads)
    // console.log(`collisions=${collision_count}`)
    return collision_count === 0 // there should have been no collision
}

describe.concurrent('Mutex', () => {
    describe('tryLock()', () => {
        const mtx = new Mutex()
        it('should should succeed when it is not locked.', () => {
            expect(mtx.tryLock()).toBeTruthy()
        })
        it('should fail when is already locked', () => {
            expect(mtx.tryLock()).toBeFalsy()
        })
    })

    describe('Critical section test: there should be only one thread in the critical section.', () => {
        it.concurrent('should pass without Mutex', async () => {
            expect(await critical_section_test({ useMutex: false })).toBeFalsy()
        })
        it.concurrent('should fail without Mutex', async () => {
            expect(await critical_section_test({ useMutex: true })).toBeTruthy()
        })
    })

    describe('Concurrent shared memory acess test', async () => {
        const mtx = new Mutex()
        let shared_mem: string | undefined
        const _thread = async (msg: string): Promise<string> => {
            await mtx.lock()
            shared_mem = msg // write message to shared memory
            await delay(Math.random() * 10) // hold execution giving chances to run to other threads
            const res = shared_mem // read shared memory back (it should have not been changed by other thread because mutuex is locked)
            mtx.unlock()
            return res
        }

        // exchanges messages
        const msg_sent: string[] = []
        for (let n = 0; n < 100; ++n) {
            msg_sent.push(crypto.randomBytes(4).toString('hex') as string)
        }

        const msg_promises: Array<Promise<string>> = []
        for (const msg of msg_sent) {
            msg_promises.push(_thread(msg))
        }

        const res = await Promise.all(msg_promises)

        for (const [n, re] of res.entries()) {
            it(`${n} ${re} is not in sent message list.`, () => {
                expect(msg_sent.includes(re)).toBeTruthy()
            })
        }

        for (const [n, element] of msg_sent.entries()) {
            it(`${n} ${element} is not in received message list.`, () => {
                expect(res.includes(element)).toBeTruthy()
            })
        }
    })
})
