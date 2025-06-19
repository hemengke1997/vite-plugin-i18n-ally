import { legacyLogicalPropertiesTransformer, StyleProvider } from '@ant-design/cssinjs'
import { RemixBrowser } from '@remix-run/react'
import i18next from 'i18next'
import { startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { getInitialNamespaces } from 'remix-i18next/client'
import { I18nAllyClient } from 'vite-plugin-i18n-ally/client'
import { i18nOptions } from '@/i18n/i18n'
import { resolveNamespace } from './i18n/namespace.client'

const i18nChangeLanguage = i18next.changeLanguage

function initialNamespaces() {
  return getInitialNamespaces().concat(i18nOptions.defaultNS)
}

async function hydrate() {
  const i18nAlly = new I18nAllyClient({
    ns: initialNamespaces(),
    fallbackLng: i18nOptions.fallbackLng,
    async onBeforeInit({ lng }) {
      await i18next.use(initReactI18next).init({
        lng,
        resources: {},
        fallbackLng: i18nOptions.fallbackLng,
        keySeparator: i18nOptions.keySeparator,
        nsSeparator: i18nOptions.nsSeparator,
        ns: initialNamespaces(),
        debug: import.meta.env.DEV,
      })
    },
    onResourceLoaded(resource, { lng, ns }) {
      i18next.addResourceBundle(lng, ns!, resource)
    },
    onInited: () => {
      startTransition(() => {
        hydrateRoot(
          document,
          <>
            <I18nextProvider i18n={i18next} defaultNS={i18nOptions.defaultNS}>
              <StyleProvider transformers={[legacyLogicalPropertiesTransformer]}>
                <RemixBrowser />
              </StyleProvider>
            </I18nextProvider>
          </>,
        )
      })
    },
    detection: [
      {
        detect: 'htmlTag',
      },
      {
        detect: 'path',
        lookup: 0,
      },
    ],
  })

  i18next.changeLanguage = async (lng?: string, ...args) => {
    await i18nAlly.asyncLoadResource(lng || i18next.language, {
      ns: [...(await resolveNamespace())],
    })
    return i18nChangeLanguage(lng, ...args)
  }
}

hydrate()
