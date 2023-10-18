import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { i18nDetector } from 'vite-plugin-i18n-detector'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vite-plugin-i18n-detector/',
  plugins: [
    react(),
    i18nDetector({
      localesPaths: [path.join(__dirname, './src/locales')],
      pathMatcher: '{locale}/{namespace}.{ext}',
      parserPlugins: [
        {
          ext: 'properties', // just for example
          parse() {
            // how to parse properties file, it's up to you
          },
        },
      ],
    }),
  ],
  clearScreen: false,
})
