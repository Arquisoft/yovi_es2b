import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    threads: false, // pruebas en monohilo
    coverage: {
      reporter: ['text', 'lcov'],
    },
  },
})
