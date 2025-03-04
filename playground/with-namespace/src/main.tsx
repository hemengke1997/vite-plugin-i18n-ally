import React from 'react'
import ReactDOM from 'react-dom/client'
import { initReactI18next } from 'react-i18next'
import i18next from 'i18next'
import { i18nAlly } from 'vite-plugin-i18n-ally/client'
import App from './App'
import { fallbackLng, lookupTarget } from './const'
import './index.css'

const root = ReactDOM.createRoot(document.querySelector('#root') as HTMLElement)

const { asyncLoadResource } = i18nAlly({
  onInit({ language }) {
    console.log(language, 'language')
    i18next.use(initReactI18next).init({
      lng: language,
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
      fallbackLng,
      lowerCaseLng: true,
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
  onResourceLoaded: (resource, { language, namespace }) => {
    i18next.addResourceBundle(language, namespace, resource)
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
  await asyncLoadResource(lang)
  return changeLanguage(lang, ...args)
}
