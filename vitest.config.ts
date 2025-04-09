import { type PluginOption } from 'vite'
import tsconfig from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 20000,
  },
  plugins: [tsconfig() as PluginOption],
})
