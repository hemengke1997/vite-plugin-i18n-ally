import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { initReactI18next } from 'react-i18next'
import { i18nAlly } from 'vite-plugin-i18n-ally/client'
import App from './App'
import { fallbackLng, lookupTarget } from './const'
import './index.css'

const root = ReactDOM.createRoot(document.querySelector('#root') as HTMLElement)

await i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
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
    supportedLngs: ['en', 'zh', 'zh-tw', 'de'],
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator'],
      caches: ['cookie', 'localStorage', 'sessionStorage'],
      lookupQuerystring: lookupTarget,
      lookupLocalStorage: lookupTarget,
      lookupSessionStorage: lookupTarget,
      lookupCookie: lookupTarget,
      htmlTag: document.documentElement,
    },
  })

const { beforeLanguageChange } = i18nAlly({
  language: i18next.language,
  onInited() {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  },
  onResourceLoaded: (langHelper, currentLang) => {
    i18next.addResourceBundle(currentLang, i18next.options.defaultNS[0], langHelper)
  },
  fallbackLng,
  cache: {
    querystring: lookupTarget,
  },
})

const _changeLanguage = i18next.changeLanguage
i18next.changeLanguage = async (lang: string, ...args) => {
  // 语言改变之前，先加载资源
  await beforeLanguageChange(lang)
  return _changeLanguage(lang, ...args)
}
