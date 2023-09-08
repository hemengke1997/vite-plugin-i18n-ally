import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { i18nDetector } from 'vite-plugin-i18n-detector'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: '../../playground-dist',
    emptyOutDir: true,
  },
  base: '/vite-plugin-i18n-detector/',
  plugins: [
    react(),
    i18nDetector({
      localesPaths: [path.join(__dirname, './src/locale')],
      pathMatcher: '{locale}/{namespace}.{ext}',
      enabledParsers: ['json'],
    }),
  ],
  clearScreen: false,
})
