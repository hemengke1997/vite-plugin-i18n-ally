import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { i18nAlly } from 'vite-plugin-i18n-ally'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vite-plugin-i18n-ally/',
  plugins: [
    react(),
    i18nAlly({
      root: __dirname,
      localesPaths: ['./src/locales'],
      namespace: true,
      pathMatcher: '{locale}/{namespace}.{ext}',
      useVscodeI18nAllyConfig: false,
    }),
  ],
})
