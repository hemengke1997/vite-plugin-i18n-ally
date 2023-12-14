import resources from 'virtual:i18n-helper'
import { name as PKGNAME } from '../../package.json'

export interface I18nSetupOptions {
  language: string
  fallbackLng: string
  /**
   * triggered when resource is loaded first time
   */
  onResourceLoaded: (langHelper: Record<string, string>, currentLang: string) => Promise<void> | void
  /**
   * triggered when i18n is inited
   */
  onInited: (langs: String[], currentLang: string) => Promise<void> | void
  /**
   * cache user language on
   */
  cache?: {
    /**
     * @default 'lang'
     * @example
     * htmlTag: 'lang' ===> <html lang="en">
     */
    htmlTag?: string | boolean
    /**
     * @example
     * querystring: 'lang' ===> https://example.com?lang=en
     */
    querystring?: string
  }
}

const langs = Object.keys(resources)

function setupI18n(options: I18nSetupOptions) {
  const { onResourceLoaded, onInited, cache, language, fallbackLng } = options || {}

  const lng = language || fallbackLng

  async function loadResourceByLang(
    lang: string,
    options?: {
      setCache?: boolean
    },
  ) {
    const { setCache = true } = options || {}

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

    await onResourceLoaded(resource, lang)

    setCache && _setCache(lang)
  }

  async function _setCache(lang: string) {
    function setHtmlTag(lang: string) {
      const { htmlTag } = cache || {}

      if (htmlTag) {
        const defaultTag = 'lang'
        const tag = typeof htmlTag === 'boolean' ? 'lang' : htmlTag
        document.querySelector('html')?.setAttribute(tag || defaultTag, lang)
      }
    }

    function setQuerystring(lang: string) {
      const { querystring } = cache || {}

      if (querystring) {
        const currentURL = new URL(window.location.href)
        currentURL.searchParams.set(querystring, lang)
        window.history.replaceState({ path: currentURL.href }, '', currentURL.href)
      }
    }

    /**
     * NOTE:
     * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
     * The following is an example for axios.
     *
     * axios.defaults.headers.common['Accept-Language'] = lang
     */

    setHtmlTag(lang)

    setQuerystring(lang)
  }

  async function _init() {
    await loadResourceByLang(fallbackLng, { setCache: false })
    if (lng !== fallbackLng) {
      await loadResourceByLang(lng, { setCache: false })
    }
    _setCache(lng)
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
