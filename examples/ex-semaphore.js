import {Semaphore} from '../dist/index.mjs'

// Signaling pattern: initial value 0 starts blocked until post() is called.
const sem = new Semaphore(0)

setTimeout(() => {
    console.log('Posting signal after 1 s')
    sem.post()
}, 1000)

console.time('wait')
await sem.wait()
console.timeEnd('wait')  // ~1000 ms
