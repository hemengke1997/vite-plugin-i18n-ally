import { resources } from 'virtual:i18n-ally-async-resource'
import { config } from 'virtual:i18n-ally-config'
import { name as I18nAllyName } from '../../package.json'
import { builtinDetectors, type Detection } from './detectors'
import { type Detector } from './detectors/types'
import { getLanguages, getNamespace, separator } from './resolver'
import { type I18nSetupOptions } from './types'
import { ensureArray, findByCase, formatLanguage, omit } from './utils'

class I18nAlly {
  private static options: I18nSetupOptions<any> = {} as I18nSetupOptions<any>
  private static currentLng: string = ''
  static allLanguages: string[] = getLanguages()
  static allNamespace: { [lang: string]: string[] } = getNamespace()

  private static loaded: { [lang: string]: Set<string> } = {}
  private static detectorMap: Map<string, Detector> = new Map()

  private static formatLanguages<T>(lang: T): T {
    return formatLanguage(lang, this.options.lowerCaseLng)
  }

  /**
   * 获取资源的语言
   */
  private static getSensitiveLang(language: string) {
    return findByCase(getLanguages(), language, this.options.lowerCaseLng) || language
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
      namespace: string | undefined
    }[] = []

    // 资源的 key 是大小写敏感的
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
          namespace: undefined,
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

          if (config.namespace && lazyload.namespace) {
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

    cacheDetector.forEach(async (d) => {
      const detector = this.detectorMap.get(d.detect)
      detector?.cacheUserLanguage?.(lang, {
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

  private static generateDetectorMap() {
    const detectors = [...builtinDetectors, ...(this.options.customDetectors || [])]
    this.detectorMap = new Map<string, Detector>(detectors.map((detector) => [detector.name, detector]))
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

      const detector = this.detectorMap.get(detection[i]?.detect)

      const detectedLang = detector?.lookup({ lookup: lookup ?? 'lang', languages: this.allLanguages })

      if (detectedLang) {
        lang = this.formatLanguages(detectedLang)

        if (this.allLanguages.includes(lang)) {
          break
        }
      }
    }

    return lang
  }

  /**
   * @description 初始化前的处理
   */
  private static beforeInit() {
    // 统一格式化语言相关的配置
    this.options.language = this.formatLanguages(this.options.language)
    this.options.fallbackLng = this.formatLanguages(this.options.fallbackLng)
    this.allLanguages = this.formatLanguages(this.allLanguages)

    this.generateDetectorMap()

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
        ? // 用户配置的namespace优先级最高。如果没有配置，则使用当前语言的namespace
          this.options.namespaces || this.allNamespace[this.currentLng] || []
        : [],
    }

    return { current }
  }

  static mount<T extends Detector[] | undefined = undefined>(options: I18nSetupOptions<T>) {
    this.options = options
    const { current } = this.beforeInit()

    {
      ;(async () => {
        try {
          await this.options.onInit?.(current, {
            languages: this.allLanguages,
            namespaces: this.allNamespace,
          })
        } catch (e) {
          console.error(`[${I18nAllyName}]: onInit error`, e)
        }

        await this.init()

        try {
          await this.options.onInited?.(current, {
            languages: this.allLanguages,
            namespaces: this.allNamespace,
          })
        } catch (e) {
          console.error(`[${I18nAllyName}]: onInited error`, e)
        }
      })()
    }

    return {
      asyncLoadResource: this.asyncLoadResource.bind(this),
      languages: this.allLanguages,
      namespaces: this.allNamespace,
    }
  }
}

const i18nAlly = I18nAlly.mount.bind(I18nAlly)

export { i18nAlly }
