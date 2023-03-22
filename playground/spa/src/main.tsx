import React from 'react'
import ReactDOM from 'react-dom/client'
import { setupI18n } from 'vite-plugin-i18n-detector/client'
import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import App from './App'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

const lookupTarget = 'lang'
const fallbackLng = 'en'

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    returnNull: false,
    react: {
      useSuspense: true,
    },
    debug: import.meta.env.DEV,
    resources: {},
    nsSeparator: '.',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
    fallbackLng,
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator'],
      caches: ['localStorage', 'sessionStorage', 'cookie'],
      lookupQuerystring: lookupTarget,
      lookupLocalStorage: lookupTarget,
      lookupSessionStorage: lookupTarget,
      lookupCookie: lookupTarget,
    },
  })

setupI18n({
  i18n: i18next,
  onLocaleChange: () => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  },
  fallbackLng,
})
