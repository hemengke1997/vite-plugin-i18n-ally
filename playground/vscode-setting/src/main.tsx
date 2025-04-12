import React from 'react'
import ReactDOM from 'react-dom/client'
import { initReactI18next } from 'react-i18next'
import i18next from 'i18next'
import { I18nAllyClient } from 'vite-plugin-i18n-ally/client'
import App from './App'
import { fallbackLng, lookupTarget } from './const'
import './index.css'

const root = ReactDOM.createRoot(document.querySelector('#root') as HTMLElement)

const i18nAlly = new I18nAllyClient({
  onBeforeInit({ lng }) {
    i18next.use(initReactI18next).init({
      lng,
      returnNull: false,
      react: {
        useSuspense: true,
      },
      debug: import.meta.env.DEV,
      resources: {},
      nsSeparator: '.',
      keySeparator: '.',
      interpolation: {
        escapeValue: false,
      },
      lowerCaseLng: true,
      fallbackLng,
    })
  },
  lowerCaseLng: true,
  onInited() {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  },
  onResourceLoaded: (resource, { lng, ns }) => {
    i18next.addResourceBundle(lng, ns!, resource)
  },
  fallbackLng,
  detection: [
    {
      detect: 'querystring',
      lookup: lookupTarget,
    },
    {
      detect: 'htmlTag',
    },
  ],
})

const changeLanguage = i18next.changeLanguage
i18next.changeLanguage = async (lang: string, ...args) => {
  await i18nAlly.asyncLoadResource(lang)
  return changeLanguage(lang, ...args)
}
