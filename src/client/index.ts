import helper from 'virtual:i18n-helper'
import { name as PKGNAME } from '../../package.json'

export interface I18nSetupOptions {
  language: string
  fallbackLng: string
  addResource: (langHelper: Record<string, string>, currentLang: string) => void
  onInit?: (langHelper: Record<string, string>, currentLang: string) => void
  onLocaleChange: (currentLang?: string) => void
  setQuery?:
    | {
        lookupTarget: string
      }
    | boolean
}

let langHelperCache: Record<string, string> | null = null

function setupI18n(options: I18nSetupOptions) {
  const { addResource, onLocaleChange, onInit, setQuery, language, fallbackLng } = options || {}

  const lng = language || fallbackLng

  async function load(
    lang: string | undefined,
    onLoaded?: (langs: Record<string, string>, currentLang: string) => void,
  ) {
    console.log(lang, 'lang')

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

    langHelperCache = (await lazyload()).default || null

    if (!langHelperCache || !Object.keys(langHelperCache).length) {
      console.warn(`[${PKGNAME}]: No locales detected, please ensure 'localesPaths' and locale files exist`)
      return
    }

    addResource(langHelperCache, lang!)

    onLoaded?.(langHelperCache, lang!)
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

  async function onLoaded() {
    // Load fallbackLng first
    if (lng !== fallbackLng) {
      load(fallbackLng)
    }

    onLanguageChanged(lng)
    onInit?.(langHelperCache || {}, lng)
  }

  onLoaded()

  return {
    loadResource: load,
    onLanguageChanged,
  }
}

export { setupI18n }
