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
    lowerCaseLng: true, // up to you
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

const { loadResource, onLanguageChanged } = setupI18n({
  language: i18next.language,
  addResource: (langs, currentLang) => {
    Object.keys(langs).forEach((ns) => {
      i18next.addResourceBundle(currentLang, ns, langs[ns])
    })
  },
  onLocaleChange: () => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  },
  fallbackLng,
})

const _changeLanguage = i18next.changeLanguage
i18next.changeLanguage = async (lang: string | undefined, ...args) => {
  let currentLng = i18next.language
  // If language did't change, return
  if (currentLng === lang) return undefined as any
  currentLng = lang || currentLng
  await loadResource(lang)
  return _changeLanguage(lang, ...args)
}

i18next.on('languageChanged', (lang) => {
  onLanguageChanged(lang)
})
