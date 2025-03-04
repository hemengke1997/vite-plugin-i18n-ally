import React from 'react'
import ReactDOM from 'react-dom/client'
import { initReactI18next } from 'react-i18next'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import i18next from 'i18next'
import { routes } from 'virtual:remix-flat-routes'
import { i18nAlly } from 'vite-plugin-i18n-ally/client'
import { GlobalContext } from './contexts/global-context'
import { fallbackLng, lookupTarget } from './locales'
import './css/tailwind.css'
import 'antd/dist/reset.css'

let namespaces: string[] = []

function main() {
  const root = ReactDOM.createRoot(document.querySelector('#root') as HTMLElement)

  const { asyncLoadResource } = i18nAlly({
    namespaces,
    async onInit({ language }) {
      await i18next.use(initReactI18next).init({
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
    lowerCaseLng: true,
    onInited() {
      root.render(
        <React.StrictMode>
          <GlobalContext.Provider>
            <RouterProvider
              router={createBrowserRouter(routes, {
                dataStrategy: async ({ matches }) => {
                  const matchesToLoad = matches.filter((m) => m.shouldLoad)
                  const results = await Promise.all(matchesToLoad.map((m) => m.resolve()))
                  namespaces = (await Promise.all(matches.map((m) => m.route.handle)))
                    .filter((t) => t?.i18n)
                    .map((t) => t.i18n)
                    .flat()

                  await asyncLoadResource(i18next.language, {
                    namespaces,
                  })

                  return results.reduce(
                    (acc, result, i) => Object.assign(acc, { [matchesToLoad[i].route.id]: result }),
                    {},
                  )
                },
              })}
            />
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
      namespaces,
    })
    return changeLanguage(lng, ...args)
  }
}

main()
