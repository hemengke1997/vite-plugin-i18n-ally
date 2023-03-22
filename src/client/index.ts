import type { i18n } from 'i18next'
import helper from 'virtual:i18n-helper'
import { name as PKGNAME } from '../../package.json'

interface I18nSetupOptions {
  i18n: i18n
  setQueryOnChange?: {
    lookupTarget: string
  }
  onLocaleChange: () => void
}

function setupI18n(options: I18nSetupOptions) {
  const { onLocaleChange, setQueryOnChange, i18n } = options || {}

  let fallbackLng = i18n.store.options.fallbackLng as string
  if (typeof fallbackLng === 'boolean') {
    fallbackLng = ''
  }
  const lng = i18n.language || fallbackLng
  let currentLng: string | undefined = lng

  async function load(lang: string | undefined, onLoaded?: () => void) {
    if (!lang) {
      console.warn(`[${PKGNAME}]: Language is undefined, fallback to '${fallbackLng}'`)
      lang = fallbackLng
    }
    if (!(lang in helper)) {
      console.warn(
        `[${PKGNAME}]: Language '${lang}' is detected but which is not defined in locales, fallback to '${fallbackLng}'. Please check your locales folder`,
      )
      lang = fallbackLng
    }

    const lazyload: () => Promise<{ default: Record<string, any> | undefined }> = helper[lang]

    const langs = (await lazyload()).default

    if (!langs) {
      console.warn(`[${PKGNAME}]: No locales detected, please ensure 'localeEntry' and locale files exist`)
      return
    }

    Object.keys(langs).forEach((ns) => {
      i18n.addResourceBundle(lang!, ns, langs[ns])
    })

    onLoaded?.()
  }

  async function setLangAttrs(lang: string) {
    if (setQueryOnChange) {
      /**
       * NOTE:
       * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
       * The following is an example for axios.
       *
       * axios.defaults.headers.common['Accept-Language'] = lang
       */
      document.querySelector('html')?.setAttribute('lang', lang)
      const { lookupTarget } = setQueryOnChange
      const queryString = (await import('query-string')).default
      const query = queryString.parse(location.search)
      query[lookupTarget] = lang
      history.replaceState({ query }, '', queryString.stringifyUrl({ url: window.location.href, query }))
    }
  }

  const _changeLanguage = i18n.changeLanguage
  i18n.changeLanguage = async (lang: string | undefined, ...args) => {
    if (currentLng === lang) return undefined as any
    currentLng = lang
    await load(lang)
    return _changeLanguage(lang, ...args)
  }

  i18n.on('languageChanged', (lang) => {
    setLangAttrs(lang)
  })

  setLangAttrs(lng)

  // Load fallbackLng first
  if (lng !== fallbackLng) {
    load(fallbackLng)
  }

  load(lng, () => {
    // Notify UI framewrok render
    onLocaleChange()
  })
}

export { setupI18n }
