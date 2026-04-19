import {defineConfig} from 'vitest/config'

export default defineConfig({
    test: {
        coverage: {
            include: ['src'],
            thresholds: {
                statements: 95,
                branches: 85,
                functions: 95,
                lines: 95,
            },
        },
    },
})
