import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { i18nDetector } from 'vite-plugin-i18n-detector'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vite-plugin-i18n-detector/',
  plugins: [
    react(),
    i18nDetector({
      root: __dirname,
      localesPaths: ['./src/locales'],
      namespace: true,
      pathMatcher: '{locale}/{namespace}.{ext}',
      dotVscodePath: false,
    }),
  ],
})
