import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { i18nDetector } from 'vite-plugin-i18n-detector'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    i18nDetector({
      include: path.join(__dirname, './src/locale'),
      localesPaths: [path.join(__dirname, './src/locale')],
      pathMatcher: '{locale}/{namespaces}.{ext}',
      enabledParsers: ['json', 'json5'],
    }),
  ],
  clearScreen: false,
})
