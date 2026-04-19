const {Mutex} = require('../dist/index.cjs')

const mtx = new Mutex()
let critData = 0

async function main() {
    await mtx.withLock(async () => {
        critData = 1
        console.log('Section 1 — critData set to', critData)
    })

    await mtx.withLock(async () => {
        console.log('Section 2 — critData is', critData)  // always 1
    })
}

main()
