import { resources } from 'virtual:i18n-ally-async-resource'
import { config } from 'virtual:i18n-ally-config'
import { name as I18nAllyName } from '../../package.json'
import { type Detection, detectorsMap } from './detectors'
import { getLanguages, getNamespaces, separator } from './resolver'
import { type I18nSetupOptions } from './types'
import { ensureArray, omit } from './utils'

class I18nAlly {
  private static options: I18nSetupOptions = {} as I18nSetupOptions
  private static currentLng: string = ''
  static allLanguages: string[] = getLanguages()
  static allNamespaces: { [lang: string]: string[] } = getNamespaces()

  private static loaded: { [lang: string]: Set<string> } = {}

  private static formatLanguages<T>(lang: T): T {
    if (Array.isArray(lang)) {
      return lang.map((l: string | undefined) => (this.options.lowerCaseLng ? l?.toLowerCase() : l)) as T
    }
    if (this.options.lowerCaseLng) {
      return (lang as string | undefined)?.toLowerCase() as T
    }
    return lang
  }

  // virtual resource is case sensitive
  private static getSensitiveLang(language: string) {
    return this.options.lowerCaseLng
      ? getLanguages().find((l) => l.toLowerCase() === language.toLowerCase()) || language
      : language
  }

  private static async loadResource(
    language?: string,
    options?: {
      namespaces?: string[] | undefined
      enableCache?: boolean // avoid querystring blink
    },
  ) {
    language = this.formatLanguages(language)
    const { fallbackLng } = this.options
    const { enableCache = true, namespaces } = options || {}

    if (!language) {
      language = this.currentLng || fallbackLng
    }

    if (!this.allLanguages.includes(language) && language !== fallbackLng) {
      this.warnFallback(language)
      language = fallbackLng
    }

    const lazyloads: {
      fn: () => Promise<{ default: Record<string, string> | undefined }>
      /**
       * 如果开启了namespace配置，则此namespace是命名空间
       *
       * 否则是语言
       */
      namespace: string
    }[] = []

    // 虚拟资源的 key 是大小写固定的
    // 从 resource 中取值时要注意用大小写敏感的语言
    language = this.getSensitiveLang(language)

    if (config.namespace) {
      if (namespaces) {
        namespaces.forEach((ns) => {
          const lazyload = resources[`${language}${separator}${ns}`]
          if (!lazyload) {
            console.warn(`[${I18nAllyName}]: Resource of namespace '${ns}' in language '${language}' is empty`)
          } else {
            lazyloads.push({
              fn: lazyload,
              namespace: ns,
            })
          }
        })
      } else {
        Object.keys(resources)
          .filter((key) => key.startsWith(`${language}${separator}`))
          .forEach((key) => {
            const ns = key.split(separator)[1]
            const lazyload = resources[key]
            lazyloads.push({
              fn: lazyload,
              namespace: ns,
            })
          })
      }
    } else {
      const lazyload = resources[language]
      if (!lazyload) {
        console.warn(`[${I18nAllyName}]: No locale resources found`)
      } else {
        lazyloads.push({
          fn: lazyload,
          namespace: language,
        })
      }
    }

    if (lazyloads.length) {
      await Promise.all(
        lazyloads.map(async (lazyload) => {
          const resources = (await lazyload.fn()).default || null
          if (!resources) {
            console.warn(`[${I18nAllyName}]: Resource of language '${language}' is empty`)
            return
          }

          if (config.namespace) {
            this.loaded[language] ||= new Set()
            this.loaded[language].add(lazyload.namespace)

            if (!this.loaded[fallbackLng]?.has(lazyload.namespace)) {
              // 如果 fallback 的 namespace 未加载，加载 fallback 的 namespace
              this.loadResource(fallbackLng, { enableCache: false, namespaces: [lazyload.namespace] })
            }
          }

          // inject resources to i18n library, eg. i18next
          await this.options.onResourceLoaded(resources, {
            language: this.formatLanguages(language),
            namespace: lazyload.namespace,
          })
        }),
      )
    }

    enableCache && this.setCache(this.formatLanguages(language))
  }

  private static setCache(lang: string) {
    const cacheDetector = (this.options.detection as Detection[])?.filter((d) => (d as Detection).cache !== false)

    if (!cacheDetector?.length) return

    cacheDetector.forEach((d) => {
      detectorsMap.get(d.detect)?.cacheUserLanguage?.(lang, {
        cache: d.lookup || 'lang',
        ...omit(d, ['detect', 'lookup', 'cache']),
        languages: this.allLanguages,
      })
    })
  }

  private static warnFallback(language: string) {
    if (language !== this.options.fallbackLng) {
      console.warn(
        `[${I18nAllyName}]: Current language '${language}' not found in locale resources, fallback to '${this.options.fallbackLng}'`,
      )
    }
  }

  private static async init() {
    const { fallbackLng, namespaces } = this.options
    await this.loadResource(fallbackLng, { enableCache: false, namespaces })
    if (this.currentLng !== fallbackLng) {
      await this.loadResource(this.currentLng, { enableCache: false, namespaces })
    }
    this.options.detection && this.setCache(this.currentLng)
  }

  static asyncLoadResource(
    language?: string,
    options?: {
      namespaces?: string[] | string
    },
  ) {
    const { namespaces } = options || {}
    return this.loadResource(language, {
      namespaces: ensureArray(namespaces),
    })
  }

  /**
   * @description Resolve current language from detector
   */
  private static resolveCurrentLng() {
    const { fallbackLng, detection } = this.options
    let lang: string = fallbackLng

    if (!detection?.length) return lang

    for (let i = 0; i < detection?.length; i++) {
      const { lookup } = detection[i] as {
        lookup: any
      }

      const detectedLang = detectorsMap
        .get(detection[i].detect)
        ?.lookup({ lookup: lookup ?? 'lang', languages: this.allLanguages })

      if (detectedLang) {
        lang = this.formatLanguages(detectedLang)

        if (this.allLanguages.includes(lang)) {
          break
        }
      }
    }

    return lang
  }

  static mount(options: I18nSetupOptions) {
    this.options = options

    this.options.language = this.formatLanguages(this.options.language)
    this.options.fallbackLng = this.formatLanguages(this.options.fallbackLng)
    this.allLanguages = this.formatLanguages(this.allLanguages)

    const resolvedLng = this.options.language || this.resolveCurrentLng()
    if (this.allLanguages.includes(resolvedLng)) {
      this.currentLng = resolvedLng
    } else {
      this.warnFallback(resolvedLng)
      this.currentLng = this.options.fallbackLng
    }

    const current = {
      language: this.currentLng,
      namespaces: config.namespace
        ? this.options.namespaces || this.allNamespaces[this.currentLng] || []
        : Object.keys(resources[this.getSensitiveLang(this.currentLng)]),
    }

    {
      ;(async () => {
        try {
          await this.options.onInit?.(current, {
            languages: this.allLanguages,
            namespaces: this.allNamespaces,
          })
        } catch (e) {
          console.error(`[${I18nAllyName}]: onInit error`, e)
        }

        await this.init()

        try {
          await this.options.onInited?.(current, {
            languages: this.allLanguages,
            namespaces: this.allNamespaces,
          })
        } catch (e) {
          console.error(`[${I18nAllyName}]: onInited error`, e)
        }
      })()
    }

    return {
      asyncLoadResource: this.asyncLoadResource.bind(this),
      languages: this.allLanguages,
      namespaces: this.allNamespaces,
    }
  }
}

const i18nAlly = I18nAlly.mount.bind(I18nAlly)

export { i18nAlly }
