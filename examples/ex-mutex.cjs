const { Mutex } = require('../dist/index.cjs')

const mtx = new Mutex()
let crit_data = 1

console.log('Access crit data #1')
mtx.lock().then(() => {
    setTimeout(() => {
        crit_data = 2
        mtx.unlock()
    }, 1000)
})

console.log('Access crit data #2')
mtx.lock().then(() => {
    console.log('crit_data = ', crit_data)
    mtx.unlock()
})
