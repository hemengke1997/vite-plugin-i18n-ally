import helper from 'virtual:i18n-helper'
import { name as PKGNAME } from '../../package.json'

export interface I18nSetupOptions {
  language: string
  fallbackLng: string
  addResource: (langHelper: Record<string, string>, currentLang: string) => void
  onInit?: (langs: String[], currentLang: string) => void
  onLocaleChange: (currentLang?: string) => void
  setQuery?:
    | {
        lookupTarget: string
      }
    | boolean
}

const langs = Object.keys(helper)

function setupI18n(options: I18nSetupOptions) {
  const { addResource, onLocaleChange, onInit, setQuery, language, fallbackLng } = options || {}

  const lng = language || fallbackLng

  async function load(
    lang: string | undefined,
    onLoaded?: (langs: Record<string, string>, currentLang: string) => void,
  ) {
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

    const lazyload: (() => Promise<{ default: Record<string, string> | undefined }>) | undefined = helper[lang]

    if (!lazyload) {
      console.error(`[${PKGNAME}]: No locales detected, please ensure 'localesPaths' and locale files exist`)
      return
    }

    const langHelper = (await lazyload()).default || null

    if (!langHelper) {
      console.warn(`[${PKGNAME}]: No locales detected, please ensure 'localesPaths' and locale files exist`)
      return
    }

    addResource(langHelper, lang!)

    onLoaded?.(langHelper, lang!)
  }

  async function onLanguageChanged(lang: string) {
    load(lang, () => {
      // Notify UI framewrok render
      onLocaleChange(lang)
    })

    if (setQuery) {
      /**
       * NOTE:
       * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
       * The following is an example for axios.
       *
       * axios.defaults.headers.common['Accept-Language'] = lang
       */
      document.querySelector('html')?.setAttribute('lang', lang)

      if (typeof setQuery === 'object') {
        const { lookupTarget } = setQuery
        const queryString = (await import('query-string')).default
        const query = queryString.parse(location.search)
        query[lookupTarget] = lang
        history.replaceState({ query }, '', queryString.stringifyUrl({ url: window.location.href, query }))
      }
    }
  }

  function onLoaded() {
    // Load fallbackLng first
    if (lng !== fallbackLng) {
      load(fallbackLng)
    }

    onLanguageChanged(lng)
    onInit?.(langs, lng)
  }

  onLoaded()

  return {
    loadResource: load,
    onLanguageChanged,
    langs,
  }
}

export { setupI18n }
