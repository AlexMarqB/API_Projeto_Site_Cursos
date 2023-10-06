import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
    test: {

        exclude: [...configDefaults.exclude, 'my-sql-database/**', '**/**.spec.js'],
    },
})