import resources from 'virtual:i18n-ally-helper'
import { name as PKGNAME } from '../../package.json'

interface CookieAttributes {
  /**
   * Define when the cookie will be removed. Value can be a Number
   * which will be interpreted as days from time of creation or a
   * Date instance. If omitted, the cookie becomes a session cookie.
   */
  expires?: number | Date | undefined

  /**
   * Define the path where the cookie is available. Defaults to '/'
   */
  path?: string | undefined

  /**
   * Define the domain where the cookie is available. Defaults to
   * the domain of the page where the cookie was created.
   */
  domain?: string | undefined

  /**
   * A Boolean indicating if the cookie transmission requires a
   * secure protocol (https). Defaults to false.
   */
  secure?: boolean | undefined

  /**
   * Asserts that a cookie must not be sent with cross-origin requests,
   * providing some protection against cross-site request forgery
   * attacks (CSRF)
   */
  sameSite?: 'strict' | 'Strict' | 'lax' | 'Lax' | 'none' | 'None' | undefined

  /**
   * An attribute which will be serialized, conformably to RFC 6265
   * section 5.2.
   */
  [property: string]: any
}

interface I18nCache {
  /**
   * @description If `true`, set language to html tag with default attribute `lang`, i.e. <html lang="en">
   * You can also set custom attribute name
   * @example
   * htmlTag: 'data-lang' ===> <html data-lang="en">
   */
  htmlTag?: string | boolean
  /**
   * @example
   * querystring: 'lang' ===> https://example.com?lang=en
   */
  querystring?: string
  /**
   * @example
   * string
   * cookie: 'lang' ===> document.cookie = 'lang=en'
   *
   * @example
   * object
   * cookie: {
   *  name: 'lang',
   *  attributes: {
   *    expires: 7,
   *  }
   * } ===> document.cookie = 'lang=en; expires=7'
   */
  cookie?:
    | string
    | {
        name: string
        attributes?: CookieAttributes
      }
  /**
   * @example
   * localStorage: 'lang' ===> localStorage.setItem('lang', 'en')
   */
  localStorage?: string
  /**
   * @example
   * sessionStorage: 'lang' ===> sessionStorage.setItem('lang', 'en')
   */
  sessionStorage?: string
}

export interface I18nSetupOptions {
  /**
   * Current language
   */
  language?: string
  /**
   * If no resource for current language, fallback to `fallbackLng`
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
   * Cache user language on html tag / querystring / cookie / localStorage / sessionStorage
   *
   * @default true
   */
  cache?: I18nCache | boolean
}

class I18nAlly {
  private static options: I18nSetupOptions = {} as I18nSetupOptions
  private static currentLng: string = ''
  static readonly langs = Object.keys(resources)
  private static readonly DEFAULT_HTML_TAG = 'lang'

  private static async loadResource(
    lang: string,
    options?: {
      enableCahe?: boolean // avoid querystring blink
    },
  ) {
    const { fallbackLng } = this.options
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

    await this.options.onResourceLoaded(resource, lang)

    enableCahe && this.setCache(lang)
  }

  private static setHtmlTag(cache: I18nCache, lang: string) {
    const { htmlTag } = cache || {}

    if (htmlTag) {
      const tag = typeof htmlTag === 'boolean' ? this.DEFAULT_HTML_TAG : htmlTag
      document.querySelector('html')?.setAttribute(tag, lang)
    }
  }

  private static getHtmlTag(htmlTag: I18nCache['htmlTag']) {
    const htmlTagString = typeof htmlTag === 'boolean' ? this.DEFAULT_HTML_TAG : htmlTag || this.DEFAULT_HTML_TAG
    return htmlTag ? document.querySelector('html')?.getAttribute(htmlTagString) : null
  }

  private static setQuerystring(cache: I18nCache, lang: string) {
    const { querystring } = cache || {}

    if (querystring) {
      const currentURL = new URL(window.location.href)
      currentURL.searchParams.set(querystring, lang)
      window.history.replaceState({ path: currentURL.href }, '', currentURL.href)
    }
  }

  private static getQuerystring(querystring: I18nCache['querystring']) {
    return querystring ? new URL(window.location.href).searchParams.get(querystring) : null
  }

  private static setCookie(cache: I18nCache, lang: string) {
    const { cookie } = cache || {}

    if (!cookie) return

    const write = (value: string) =>
      encodeURIComponent(value).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent)

    let name: string

    let attributes: CookieAttributes = Object.assign({}, { path: '/' })
    if (typeof cookie === 'object') {
      name = cookie.name

      attributes = Object.assign(attributes, cookie?.attributes)
      if (typeof attributes.expires === 'number') {
        attributes.expires = new Date(Date.now() + attributes.expires * 864e5)
      }
      if (attributes.expires) {
        // @ts-expect-error
        attributes.expires = attributes.expires.toUTCString()
      }
    } else {
      name = cookie || 'lang'
    }

    name = encodeURIComponent(name)
      .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape)

    let stringifiedAttributes = ''
    for (const attributeName in attributes) {
      if (!attributes[attributeName]) {
        continue
      }

      stringifiedAttributes += `; ${attributeName}`

      if (attributes[attributeName] === true) {
        continue
      }

      // Considers RFC 6265 section 5.2:
      // ...
      // 3.  If the remaining unparsed-attributes contains a %x3B (";")
      //     character:
      // Consume the characters of the unparsed-attributes up to,
      // not including, the first %x3B (";") character.
      // ...
      stringifiedAttributes += `=${attributes[attributeName].split(';')[0]}`
    }

    return (document.cookie = `${name}=${write(lang)}${stringifiedAttributes}`)
  }

  private static getCookie(cookie: I18nCache['cookie']) {
    const reader = (value: string) => {
      if (value[0] === '"') {
        value = value.slice(1, -1)
      }
      return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
    }
    const name = typeof cookie === 'string' ? cookie : cookie?.name

    if (!name) return null

    // To prevent the for loop in the first place assign an empty array
    // in case there are no cookies at all.
    const cookies = document.cookie ? document.cookie.split('; ') : []
    const jar: Record<string, string> = {}
    for (let i = 0; i < cookies.length; i++) {
      const parts = cookies[i].split('=')
      const value = parts.slice(1).join('=')

      try {
        const found = decodeURIComponent(parts[0])
        if (!(found in jar)) jar[found] = reader(value)
        if (name === found) {
          break
        }
      } catch {
        // Do nothing...
      }
    }

    return jar[name] || null
  }

  private static setSessionStorage(cache: I18nCache, lang: string) {
    const { sessionStorage } = cache || {}

    if (sessionStorage) {
      window.sessionStorage.setItem(sessionStorage, lang)
    }
  }

  private static getSessionStorage(sessionStorage: I18nCache['sessionStorage']) {
    return sessionStorage ? window.sessionStorage.getItem(sessionStorage) : null
  }

  private static setLocalStorage(cache: I18nCache, lang: string) {
    const { localStorage } = cache || {}

    if (localStorage) {
      window.localStorage.setItem(localStorage, lang)
    }
  }

  private static getLocalStorage(localStorage: I18nCache['localStorage']) {
    return localStorage ? window.localStorage.getItem(localStorage) : null
  }

  private static setCache(lang: string) {
    const cacheObj = typeof this.options.cache === 'boolean' ? {} : this.options.cache || {}

    this.setHtmlTag(cacheObj, lang)
    this.setQuerystring(cacheObj, lang)
    this.setCookie(cacheObj, lang)
    this.setLocalStorage(cacheObj, lang)
    this.setSessionStorage(cacheObj, lang)
  }

  static async init() {
    const { fallbackLng } = this.options
    await this.loadResource(fallbackLng, { enableCahe: false })
    if (this.currentLng !== fallbackLng) {
      await this.loadResource(this.currentLng, { enableCahe: false })
    }
    this.options.cache && this.setCache(this.currentLng)
  }

  static async beforeLanguageChange(lng: string) {
    await this.loadResource(lng)
  }

  private static isEmptyCache(cache: I18nSetupOptions['cache']) {
    if (!cache) return true
    if (typeof cache === 'boolean') {
      return !cache
    }
    return Object.keys(cache).length === 0
  }

  /**
   * @description Resolve current language from html tag / querystring / cookie / localStorage / sessionStorage
   *
   */
  private static resolveCurrentLng() {
    const { fallbackLng } = this.options
    let lang: string = fallbackLng

    const cacheObj = typeof this.options.cache === 'boolean' ? {} : this.options.cache || {}

    if (this.isEmptyCache(this.options.cache)) {
      return lang
    }

    const { querystring, cookie, localStorage, sessionStorage, htmlTag } = cacheObj

    const querystringLang = this.getQuerystring(querystring)
    const cookieLang = this.getCookie(cookie)
    const localStorageLang = this.getLocalStorage(localStorage)
    const sessionStorageLang = this.getSessionStorage(sessionStorage)
    const htmlTagLang = this.getHtmlTag(htmlTag)

    // TODO: user custom priority
    lang = querystringLang || cookieLang || localStorageLang || sessionStorageLang || htmlTagLang || lang

    return lang
  }

  static mount(options: I18nSetupOptions) {
    this.options = options

    this.currentLng = this.options.language || this.resolveCurrentLng()

    this.init().then(async () => {
      try {
        await this.options.onInited?.(this.langs, this.currentLng)
      } catch (e) {
        console.error(`[${PKGNAME}]: onInited error`, e)
      }
    })

    return {
      beforeLanguageChange: this.beforeLanguageChange.bind(this),
      langs: this.langs,
    }
  }
}

const i18nAlly = I18nAlly.mount.bind(I18nAlly)

export { i18nAlly }
