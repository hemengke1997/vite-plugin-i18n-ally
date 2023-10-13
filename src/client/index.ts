import resources from 'virtual:i18n-helper'
import { name as PKGNAME } from '../../package.json'

export interface I18nSetupOptions {
  language: string
  fallbackLng: string
  onResourceLoaded: (langHelper: Record<string, string>, currentLang: string) => Promise<void> | void
  onInited: (langs: String[], currentLang: string) => Promise<void> | void
  query?: {
    html?: string
    url?: string
  }
}

const langs = Object.keys(resources)

function setupI18n(options: I18nSetupOptions) {
  const { onResourceLoaded, onInited, query, language, fallbackLng } = options || {}

  const lng = language || fallbackLng

  async function loadResourceByLang(lang: string | undefined) {
    if (!lang) {
      console.warn(`[${PKGNAME}]: Language is undefined, fallback to '${fallbackLng}'`)
      lang = fallbackLng
    }
    if (!(lang in resources)) {
      console.warn(
        `[${PKGNAME}]: Language '${lang}' is detected but which is not defined in locales, fallback to '${fallbackLng}'. Please check your locales folder`,
      )
      lang = fallbackLng
    }

    const lazyload: (() => Promise<{ default: Record<string, string> | undefined }>) | undefined = resources[lang]

    if (!lazyload) {
      console.error(`[${PKGNAME}]: No locales detected, please ensure 'localesPaths' and locale files exist`)
      return
    }

    const resource = (await lazyload()).default || null

    if (!resource) {
      console.warn(`[${PKGNAME}]: Resource for language '${lang}' is empty, fallback to '${fallbackLng}'`)
      return
    }

    await onResourceLoaded(resource, lang!)

    _setQuery(lang!)
  }

  async function _setQuery(lang: string) {
    /**
     * NOTE:
     * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
     * The following is an example for axios.
     *
     * axios.defaults.headers.common['Accept-Language'] = lang
     */

    document.querySelector('html')?.setAttribute(query?.html || 'lang', lang)

    if (query?.url) {
      const urlQuery = new URLSearchParams(window.location.search)
      urlQuery.set(query.url, lang)
      const newURL = `${window.location.pathname}?${urlQuery.toString()}`
      window.history.pushState({ path: newURL }, '', newURL)
    }
  }

  async function _init() {
    await loadResourceByLang(fallbackLng)
    if (lng !== fallbackLng) {
      await loadResourceByLang(lng)
    }
  }

  _init().then(async () => {
    await onInited?.(langs, lng)
  })

  return {
    loadResourceByLang,
    langs,
  }
}

export { setupI18n }
