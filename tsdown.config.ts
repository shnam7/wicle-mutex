import {defineConfig} from 'tsdown'

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    tsconfig: 'tsconfig.build.json',
})
