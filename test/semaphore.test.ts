import { describe, expect, it } from 'vitest'
import { Semaphore } from '../src/index.js'

/**
 * Producer-Consumer handshaking
 *
 * @param { max_produce } # of produce actions
 * @param { handshake } # of produce actions
 * @returns Promise for producer/consumer test result (succes or failure)
 */
export const producer_consumer = async ({ max_produce = 100, handshake = false } = {}): Promise<boolean> => {
    let consumer_sum = 0
    let expected_sum = 0
    let shared_mem = 0
    const sem_reader = handshake ? new Semaphore(0) : undefined
    const sem_writer = handshake ? new Semaphore(0) : undefined

    const producer = async () => {
        // console.log('Producer started.')
        let count = 0
        while (++count <= max_produce) {
            shared_mem = count
            expected_sum += count
            // console.log(`producer count=${count} sent_val=${shared_mem} expected_sum=${expected_sum}`)
            sem_writer?.post() // signal to reader that write is done
            // eslint-disable-next-line no-await-in-loop
            await sem_reader?.wait() // wait for the reader to process
        }
        // console.log('Producer finished.')
    }

    const consumer = async () => {
        // console.log('Consumer started.')
        let count = 0
        while (++count <= max_produce) {
            // eslint-disable-next-line no-await-in-loop
            await sem_writer?.wait() // wait for the writer to process
            consumer_sum += shared_mem
            // console.log(`consumer count=${count} rcvd_val=${shared_mem} consumer_sum=${consumer_sum}`)
            sem_reader?.post() // signal to writer that read is done
        }
        // console.log('Consumer finished.')
    }

    await Promise.all([producer(), consumer()])
    // console.log(`Finished: consumer_sum=${consumer_sum} expected_sum=${expected_sum}`)
    return consumer_sum === expected_sum
}

describe('Semapare Test', () => {
    describe('tryAquire(): single resource allocation test', () => {
        const sem = new Semaphore()
        it('should fail with when no resource is available', () => {
            expect(sem.tryAcquire()).toBeFalsy()
        })
        it('now should succeed when a resource is released.', () => {
            sem.release()
            expect(sem.tryAcquire()).toBeTruthy()
        })
        it('expects sepaphore value to be 0.', () => {
            expect(sem.value).toBe(0)
        })
    })

    describe('tryWait(): multiple resource allocation test', () => {
        const MAX_ACCESS = 110
        const sem = new Semaphore(MAX_ACCESS)
        it(`should succeed up to ${MAX_ACCESS} times`, () => {
            for (let i = 0; i < MAX_ACCESS; ++i) expect(sem.tryWait()).toBeTruthy()
            expect(sem.value).toBe(0)
        })
        it('now should fail', () => {
            expect(sem.tryAcquire()).toBeFalsy()
        })
        it('After releasing once, should succeed', () => {
            sem.release()
            expect(sem.tryAcquire()).toBeTruthy()
        })
    })

    describe('Producer/Consumer test', () => {
        it('should fail w/o handshaking', async () => {
            expect(await producer_consumer({ handshake: false })).toBeFalsy()
        })
        it('should succeed with handsking using semaphore', async () => {
            expect(await producer_consumer({ handshake: true })).toBeTruthy()
        })
    })
})
