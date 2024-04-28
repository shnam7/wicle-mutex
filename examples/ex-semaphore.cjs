const { Semaphore } = require('../dist/index.cjs')

const sem = new Semaphore()

setTimeout(() => {
    sem.release()
}, 1000)

console.time('semaphore wait')

sem.wait().then(() => {
    console.timeEnd('semaphore wait')
})
