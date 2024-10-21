import React from 'react'
import { initReactI18next } from 'react-i18next'
import i18next from 'i18next'
import ReactDOM from 'react-dom/client'
import { resources } from 'virtual:i18n-ally-resource'
import { i18nAlly } from 'vite-plugin-i18n-ally/client'
import App from './app'
import { fallbackLng, lookupTarget } from './const'
import { resolveNamespace } from './locales'
import './css/tailwind.css'
import 'antd/dist/reset.css'

console.log(resources, 'all locales')

const root = ReactDOM.createRoot(document.querySelector('#root') as HTMLElement)

const { asyncLoadResource } = i18nAlly({
  namespaces: await resolveNamespace(),
  onInit({ language }) {
    i18next.use(initReactI18next).init({
      lng: language,
      returnNull: false,
      react: {
        useSuspense: true,
      },
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
  onInited(...args) {
    console.log(args, 'onInited')
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
      detect: 'cookie',
      lookup: 'remix-flat-routes-lang',
    },
    {
      detect: 'htmlTag',
    },
  ],
})

const changeLanguage = i18next.changeLanguage
i18next.changeLanguage = async (lng?: string, ...args) => {
  await asyncLoadResource(lng || i18next.language, {
    namespaces: await resolveNamespace(),
  })
  return changeLanguage(lng, ...args)
}

export { asyncLoadResource }
