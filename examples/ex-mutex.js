import { Mutex } from '../dist/index.js'

const mtx = new Mutex()
let crit_data = 1

console.log('Access crit data #1')
await mtx.lock()
setTimeout(() => {
    crit_data = 2
    mtx.unlock()
}, 1000)

console.log('Access crit data #2')
await mtx.lock()
console.log('crit_data = ', crit_data)
mtx.unlock()
