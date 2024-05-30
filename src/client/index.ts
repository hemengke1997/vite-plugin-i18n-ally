import resources from 'virtual:i18n-ally-helper'
import { name as PKGNAME } from '../../package.json'

export interface I18nSetupOptions {
  /**
   * Current language
   */
  language?: string
  /**
   * If no resource of current language, fallback to `fallbackLng`
   */
  fallbackLng: string
  /**
   * Triggered when i18n-ally is inited
   */
  onInited: (langs: string[], lang: string) => Promise<void> | void
  /**
   * Triggered when resource is loaded first time
   */
  onResourceLoaded: (resource: Record<string, string>, lang: string) => Promise<void> | void
  /**
   * Cache user language on html tag or querystring
   * i18next-browser-languagedetector will detect language from querystring or html tag,
   * but it will not set language to html tag or querystring.
   * so you can enable this option to set language to html tag or querystring
   *
   * @default true
   */
  cache?:
    | {
        /**
         * @example
         * htmlTag: 'data-lang' ===> <html data-lang="en">
         */
        htmlTag?: string | boolean
        /**
         * @example
         * querystring: 'lang' ===> https://example.com?lang=en
         */
        querystring?: string
      }
    | boolean
}

const langs = Object.keys(resources)

function i18nAlly(options: I18nSetupOptions) {
  const { onResourceLoaded, onInited, cache = true, language, fallbackLng } = options || {}

  const lng = language || fallbackLng

  async function loadResource(
    lang: string,
    options?: {
      enableCahe?: boolean // avoid querystring blink
    },
  ) {
    const { enableCahe = true } = options || {}

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

    enableCahe && setCache(lang)
  }

  async function setCache(lang: string) {
    const cacheObj = typeof cache === 'boolean' ? {} : cache

    function setHtmlTag(lang: string) {
      const { htmlTag } = cacheObj || {}

      if (htmlTag) {
        const defaultTag = 'lang'
        const tag = typeof htmlTag === 'boolean' ? defaultTag : htmlTag
        document.querySelector('html')?.setAttribute(tag, lang)
      }
    }

    function setQuerystring(lang: string) {
      const { querystring } = cacheObj || {}

      if (querystring) {
        const currentURL = new URL(window.location.href)
        currentURL.searchParams.set(querystring, lang)
        window.history.replaceState({ path: currentURL.href }, '', currentURL.href)
      }
    }

    setHtmlTag(lang)
    setQuerystring(lang)
  }

  async function init() {
    await loadResource(fallbackLng, { enableCahe: false })
    if (lng !== fallbackLng) {
      await loadResource(lng, { enableCahe: false })
    }
    cache && setCache(lng)
  }

  init().then(async () => {
    try {
      await onInited?.(langs, lng)
    } catch (e) {
      console.error(`[${PKGNAME}]: onInited error`, e)
    }
  })

  async function beforeLanguageChange(lng: string) {
    await loadResource(lng)
  }

  return {
    beforeLanguageChange,
    langs,
  }
}

export { i18nAlly }
