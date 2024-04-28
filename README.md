# @wicle/mutex

Simple `Mutex` and `Semaphore` implementation written in TypeScript.

`Semaphore` uses [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to implement posix semaphore functions, `wait`, `post`, and get `value`.

`Mutex` uses `Semaphore` to implement posix mutex funtions, `lock`, `unlock`, and `tryLock`.

## Installation

```bash
# npm
npm i '@wicle/mutex'

# yarn
yarn add '@wicle/mutex'

# pnpm
pnom add '@wicle/mutex'
```

## Usage

### Semaphore

```ts
import { Semaphore } from '@wicle/mutex'

const sem = new Semaphore()
setTimeout(() => { sem.release() }, 1000)

console.time('semaphore wait')
await sem.wait()
console.timeEnd('semaphore wait')
```

#### Mutex

```ts
import { Mutex } from '@wicle/mutex'

const mtx = new Mutex()
let crit_data = 1

console.log('Access crit data #1')
await mtx.lock()
setTimeout(() => { crit_data = 2; mtx.unlock() }, 1000)

console.log('Access crit data #2')
await mtx.lock()
console.log('crit_data = ', crit_data)
mtx.unlock()
```

## API

### Semaphore

#### constructor
const sem = new Semaphore([value])
Create a new Semaphore instance. value is number of available resources, whcich defaults to 0.

#### sem.wait()
POSIX semaphore interface for sem_wait().
Returns a promise waiting for the semaphore to be signaled (resource available).
Use await or Proimise.then() to wait for the signal.
```ts
await sem.wait()
// your code...

// or
sem.wait().then(()=>{
    // your code...
})
```

#### sem.tryWait()
POSIX semaphore interface for sem_trywait().
Check if tghe semaphore is signaled without waiting.
Returns true if the semaphoire is in signaled state, or false

#### sem.post()
POSIX semaphore interface for sem_post(). Alias fore release()
Returns void

#### sem.value
Semapohore value, whichi means resouce count currently available or signaled count.

#### sem.aquire()
Aquire semaphore resource.
Alias to sem.wait().
Use await or Proimise.then() to wait for the resource to be aquired.

#### sem.tryAquire()
Try aquiring semaphore resource. returns immediately if the access not available.
Alias to sem.tryWait().
Returns true if the access aquired, or false.

#### sem.release()
Release semaphore resource.
Alias to sem.post().


### Mutex

#### constructor
const mtx = new Mutex()
Create a new Mutex instance.

#### mtx.lock()
Get access to the exclusive resource.
Returns Promise to get the access the resource (lock).
Use await or Proimise.then() to wait for the resource to be available.
```ts
await mtx.lock()
// your code...

// or
mtx.lock().then(()=>{
    // your code...
})
```

#### mtx.tryLock()
Try to get access to the exclusive resource without waiting.
Returns true if the aquired, or false.

#### mtx.unlock()
Unlock the exclusive resource.


## License
MIT - Copyright © 2024 Robin Nam
