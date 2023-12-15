import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { i18nDetector } from 'vite-plugin-i18n-detector'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    i18nDetector({
      root: __dirname,
      dotVscodePath: __dirname,
    }),
  ],
})
