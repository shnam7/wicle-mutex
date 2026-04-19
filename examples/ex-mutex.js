import {Mutex} from '../dist/index.mjs'

const mtx = new Mutex()
let critData = 0

// withLock acquires, runs the callback, then releases — even if the callback throws.
await mtx.withLock(async () => {
    critData = 1
    console.log('Section 1 — critData set to', critData)
})

await mtx.withLock(async () => {
    console.log('Section 2 — critData is', critData)  // always 1
})
