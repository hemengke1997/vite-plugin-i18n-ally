import React from 'react'
import ReactDOM from 'react-dom/client'
import { initReactI18next } from 'react-i18next'
import i18next from 'i18next'
import { I18nAllyClient } from 'vite-plugin-i18n-ally/client'
import App from './App'
import { fallbackLng, lookupTarget } from './const'
import './index.css'

const root = ReactDOM.createRoot(document.querySelector('#root') as HTMLElement)

const { asyncLoadResource } = new I18nAllyClient({
  onInit({ language }) {
    i18next.use(initReactI18next).init({
      lng: language,
      returnNull: false,
      react: {
        useSuspense: true,
      },
      debug: import.meta.env.DEV,
      resources: {},
      keySeparator: '.',
      interpolation: {
        escapeValue: false,
      },
      lowerCaseLng: true,
      fallbackLng,
    })
  },
  lowerCaseLng: true,
  onInited(...args) {
    console.log(args, 'onInited')
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  },
  onResourceLoaded: (resources, { language }) => {
    i18next.addResourceBundle(language, 'translation', resources)
  },
  fallbackLng,
  detection: [
    {
      detect: 'querystring',
      lookup: lookupTarget,
    },
    {
      detect: 'cookie',
      lookup: 'without-namespace-lang',
    },
    {
      detect: 'htmlTag',
      cache: true,
    },
  ],
})

const changeLanguage = i18next.changeLanguage
i18next.changeLanguage = async (lang: string, ...args) => {
  await asyncLoadResource(lang)
  return changeLanguage(lang, ...args)
}
