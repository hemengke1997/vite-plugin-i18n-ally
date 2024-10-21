import { resources } from 'virtual:i18n-ally-async-resource'
import { config } from 'virtual:i18n-ally-config'
import { name as I18nAllyName } from '../../package.json'
import { type Detection, detectorsMap } from './detectors'
import { type I18nSetupOptions } from './types'
import { ensureArray, omit } from './utils'

class I18nAlly {
  private static options: I18nSetupOptions = {} as I18nSetupOptions
  private static currentLng: string = ''
  private static enableNamespace: boolean = config.namespace

  private static async loadResource(
    language?: string,
    options?: {
      namespaces?: string[]
      enableCache?: boolean // avoid querystring blink
    },
  ) {
    const { fallbackLng } = this.options
    const { enableCache = true, namespaces } = options || {}

    if (!language) {
      language = this.currentLng || fallbackLng
    }

    if (!(language in resources)) {
      console.warn(
        `[${I18nAllyName}]: Current language '${language}' not found in locale resources, fallback to '${fallbackLng}'`,
      )
      language = fallbackLng
    }

    const lazyloads: {
      fn: () => Promise<{ default: Record<string, string> | undefined }>
      namespace: string
    }[] = []

    if (namespaces?.length) {
      namespaces.forEach((ns) => {
        const lazyload = resources[`${language}/${ns}`]
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
      const lazyload = resources[language]
      if (!lazyload) {
        console.error(`[${I18nAllyName}]: No locale resources found. Please check config`)
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
            console.warn(`[${I18nAllyName}]: Resource of language '${language}' is empty, fallback to '${fallbackLng}'`)
            return
          }
          await this.options.onResourceLoaded(resources, {
            language,
            namespace: lazyload.namespace,
          })
        }),
      )
      enableCache && this.setCache(language)
    }
  }

  private static setCache(lang: string) {
    const cacheDetector = (this.options.detection as Detection[])?.filter((d) => (d as Detection).cache !== false)

    if (!cacheDetector?.length) return

    cacheDetector.forEach((d) => {
      detectorsMap.get(d.detect)?.cacheUserLanguage?.(lang, {
        cache: d.lookup || 'lang',
        ...omit(d, ['detect', 'lookup', 'cache']),
      })
    })
  }

  private static async init() {
    const { fallbackLng, namespaces } = this.options
    await this.loadResource(fallbackLng, { enableCache: false, namespaces })
    if (this.currentLng !== fallbackLng) {
      await this.loadResource(this.currentLng, { enableCache: false, namespaces })
    }
    this.options.detection && this.setCache(this.currentLng)
  }

  private static asyncLoadResource(
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
   *
   */
  private static resolveCurrentLng() {
    const { fallbackLng, detection } = this.options
    let lang: string = fallbackLng

    if (!detection?.length) return lang

    for (let i = 0; i < detection?.length; i++) {
      const lookup = (
        detection[i] as {
          lookup: any
        }
      ).lookup
      const detectedLang = detectorsMap.get(detection[i].detect)?.lookup({ lookup: lookup || 'lang' })
      if (detectedLang) {
        lang = detectedLang
        break
      }
    }

    return lang
  }

  private static resolveNamespaces() {
    if (this.enableNamespace) {
      const namespaceMap = new Map<string, string[]>()
      Object.keys(resources)
        .filter((key) => key.includes('/'))
        .forEach((key) => {
          const [lang, ns] = key.split('/')
          const namespaces = namespaceMap.get(lang) || []
          namespaces.push(ns)
          namespaceMap.set(lang, namespaces)
        })

      return Object.fromEntries(namespaceMap)
    } else {
      const r: { [lang: string]: string[] } = {}
      Object.keys(resources).forEach((key) => {
        r[key] = []
      })
      return r
    }
  }

  static mount(options: I18nSetupOptions) {
    this.options = options
    this.currentLng = this.options.language || this.resolveCurrentLng()

    const allLanguages = Object.keys(resources).filter((key) => !key.includes('/'))
    const allNamespaces = this.resolveNamespaces()

    const current = {
      language: this.currentLng,
      namespaces: this.enableNamespace
        ? this.options.namespaces || this.resolveNamespaces()[this.currentLng] || []
        : Object.keys(resources[this.currentLng]),
    }

    const all = {
      languages: allLanguages,
      namespaces: allNamespaces,
    }

    {
      ;(async () => {
        try {
          await this.options.onInit?.(current, all)
        } catch (e) {
          console.error(`[${I18nAllyName}]: onInit error`, e)
        }

        await this.init()

        try {
          await this.options.onInited?.(current, all)
        } catch (e) {
          console.error(`[${I18nAllyName}]: onInited error`, e)
        }
      })()
    }

    return {
      asyncLoadResource: this.asyncLoadResource.bind(this),
      ...all,
    }
  }
}

const i18nAlly = I18nAlly.mount.bind(I18nAlly)

export { i18nAlly }
