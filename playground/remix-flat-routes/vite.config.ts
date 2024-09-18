import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { i18nAlly } from 'vite-plugin-i18n-ally'
import { remixFlatRoutes } from 'vite-plugin-remix-flat-routes'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    remixFlatRoutes({
      flatRoutesOptions: {
        ignoredRouteFiles: ['**/components/**', '**/hooks/**', '**/contexts/**'],
      },
    }),
    i18nAlly({
      root: __dirname,
      localesPaths: ['./app/locales'],
      namespace: true,
      pathMatcher: '{locale}/{namespace}.{ext}',
      useVscodeI18nAllyConfig: true,
    }),
  ],
})
