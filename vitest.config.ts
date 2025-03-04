import { type PluginOption } from 'vite'
import tsconfig from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', './playground/**/*.*', './playground-temp/**/*.*'],
    testTimeout: 20000,
  },
  plugins: [tsconfig() as PluginOption],
})
