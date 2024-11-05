import React from 'react'
import { initReactI18next } from 'react-i18next'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import i18next from 'i18next'
import ReactDOM from 'react-dom/client'
import { routes } from 'virtual:remix-flat-routes'
import { i18nAlly } from 'vite-plugin-i18n-ally/client'
import { fallbackLng, lookupTarget } from './const'
import { GlobalContext } from './contexts/global-context'
import { resolveNamespace } from './locales'
import './css/tailwind.css'
import 'antd/dist/reset.css'

async function main() {
  const root = ReactDOM.createRoot(document.querySelector('#root') as HTMLElement)

  const { asyncLoadResource } = i18nAlly({
    namespaces: await resolveNamespace(),
    async onInit({ language }) {
      await i18next.use(initReactI18next).init({
        lng: language,
        ns: await resolveNamespace(),
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
    onInited() {
      root.render(
        <React.StrictMode>
          <GlobalContext.Provider>
            <RouterProvider router={createBrowserRouter(routes)} />
          </GlobalContext.Provider>
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

  window.__asyncLoadResource = asyncLoadResource
}

try {
  main()
} catch {}
