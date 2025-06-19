import type { I18nAllyClient } from 'vite-plugin-i18n-ally/client'

declare global {
  interface Window {
    i18nAlly: I18nAllyClient
  }
}

export {}
