import { Semaphore } from '../dist/index.js'

const sem = new Semaphore()

setTimeout(() => {
    sem.release()
}, 1000)

console.time('semaphore wait')
await sem.wait()
console.timeEnd('semaphore wait')
