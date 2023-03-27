import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    onConsoleLog(log) {
      if (log.includes('Generated an empty chunk')) {
        return false
      }
      return undefined
    },
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__test__/setup.ts'],
  },
})
