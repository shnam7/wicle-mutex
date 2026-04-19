const {Semaphore} = require('../dist/index.cjs')

const sem = new Semaphore(0)

async function main() {
    setTimeout(() => {
        console.log('Posting signal after 1 s')
        sem.post()
    }, 1000)

    console.time('wait')
    await sem.wait()
    console.timeEnd('wait')  // ~1000 ms
}

main()
