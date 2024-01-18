import resources from 'virtual:i18n-helper'
import { name as PKGNAME } from '../../package.json'

export interface I18nSetupOptions {
  /**
   * Current language
   */
  language: string
  /**
   * If no resource of current language, fallback to `fallbackLng`
   */
  fallbackLng: string
  /**
   * Triggered when resource is loaded first time
   */
  onResourceLoaded: (langHelper: Record<string, string>, currentLang: string) => Promise<void> | void
  /**
   * Triggered when i18n is inited
   */
  onInited: (langs: string[], currentLang: string) => Promise<void> | void
  /**
   * Cache user language on
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
      console.warn(`[${PKGNAME}]: 'language' undefined, fallback to '${fallbackLng}'`)
      lang = fallbackLng
    }

    if (!(lang in resources)) {
      console.warn(
        `[${PKGNAME}]: Current language '${lang}' not found in locale resources, fallback to '${fallbackLng}'`,
      )
      lang = fallbackLng
    }

    const lazyload: (() => Promise<{ default: Record<string, string> | undefined }>) | undefined = resources[lang]

    if (!lazyload) {
      console.error(`[${PKGNAME}]: No locale resources found. Please check config`)
      return
    }

    const resource = (await lazyload()).default || null

    if (!resource) {
      console.warn(`[${PKGNAME}]: Resource of language '${lang}' is empty, fallback to '${fallbackLng}'`)
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
    try {
      await onInited?.(langs, lng)
    } catch (e) {
      console.error(`[${PKGNAME}]: onInited error`, e)
    }
  })

  return {
    loadResourceByLang,
    langs,
  }
}

export { setupI18n }
