import { resources } from 'virtual:i18n-ally-async-resource'
import { config } from 'virtual:i18n-ally-config'
import { type Detection, detectLanguage } from '../utils/detect'
import { getSupportedLngs, getSupportedNs } from '../utils/supported'
import { ensureArray, findByCase, formatLng, omit } from '../utils/utils'
import { builtinDetectors } from './detectors'
import { type Detector } from './detectors/types'
import { Logger } from './logger'
import { type I18nAllyClientOptions } from './types'

export class I18nAllyClient<T extends Detector[] | undefined = undefined> {
  private readonly options: I18nAllyClientOptions<T> = {} as I18nAllyClientOptions<T>

  private loaded: { [lng: string]: Set<string> } = {}
  private detectorMap: Map<string, Detector> = new Map()
  private logger: Logger = undefined!

  lng?: string
  lngs: string[] = []
  fallbackLng: string = ''

  /**
   * @description
   * 当前语言
   */
  language: string = ''
  /**
   * @description
   * i18n-ally资源支持的语言
   */
  supportedLngs: string[] = getSupportedLngs()
  supportedNs: { [lng: string]: string[] } = getSupportedNs()

  constructor(options: I18nAllyClientOptions<T>) {
    this.options = options

    this.logger = new Logger(options.logLevel)

    const { current } = this.onReady()

    {
      ;(async () => {
        try {
          await this.options.onBeforeInit?.(current, {
            lngs: this.lngs,
            ns: this.supportedNs,
          })
        } catch (e) {
          this.logger.error(`onBeforeInit error`, e)
        }

        await this.init()

        try {
          await this.options.onInited?.(current, {
            lngs: this.lngs,
            ns: this.supportedNs,
          })
        } catch (e) {
          this.logger.error(`onInited error`, e)
        }
      })()
    }

    return this
  }

  asyncLoadResource(
    lng?: string,
    options?: {
      ns?: string[] | string
    },
  ) {
    const { ns } = options || {}
    return this.loadResource(lng, {
      ns: ensureArray(ns),
    })
  }

  private onReady() {
    // 统一格式化语言相关的配置
    // 不更改用户传入的配置，保持options是用户传入的配置
    this.lng = this.formatLngs(this.options.lng)
    this.fallbackLng = this.formatLngs(this.options.fallbackLng)
    this.supportedLngs = this.formatLngs(this.supportedLngs)

    this.lngs = this.formatLngs(this.options.lngs || []).filter((lng) => this.supportedLngs.includes(lng))
    if (!this.lngs?.length) {
      this.lngs = this.supportedLngs
    }

    this.generateDetectorMap()

    const resolvedLng = this.lng || this.detect()
    if (this.lngs.includes(resolvedLng)) {
      this.language = resolvedLng
    } else {
      this.warnFallback(resolvedLng)
      this.language = this.fallbackLng
    }

    const current = {
      lng: this.language,
      ns: config.namespace
        ? // 用户配置的namespace优先级最高。如果没有配置，则使用当前语言的namespace
          this.options.ns || this.supportedNs[this.language] || []
        : [],
    }

    return { current }
  }

  private formatLngs<T>(lng: T): T {
    return formatLng(lng, this.options.lowerCaseLng)
  }

  /**
   * 获取资源的语言
   */
  private getSensitiveLang(lng: string) {
    return findByCase(getSupportedLngs(), lng, this.options.lowerCaseLng) || lng
  }

  private async loadResource(
    lng?: string,
    options?: {
      ns?: string[] | undefined
      enableCache?: boolean // avoid querystring blink
    },
  ) {
    lng = this.formatLngs(lng)
    const { fallbackLng } = this.options
    const { enableCache = true } = options || {}
    let { ns } = options || {}

    if (!lng) {
      lng = this.language || fallbackLng
    }

    if (!this.lngs.includes(lng) && lng !== fallbackLng) {
      this.warnFallback(lng)
      lng = fallbackLng
    }

    const lazyloads: {
      fn: () => Promise<{ default: Record<string, string> | undefined }>
      ns: string | undefined
    }[] = []

    // 资源的 key 是大小写敏感的
    // 从 resource 中取值时要注意用大小写敏感的语言
    lng = this.getSensitiveLang(lng)

    if (config.namespace) {
      // 希望请求的 ns
      // 如果没有传入，则使用初始化时的 ns
      ns ||= this.options.ns
      if (ns) {
        ns.forEach((ns) => {
          const lazyload = resources[`${lng}${config.separator}${ns}`]
          if (!lazyload) {
            this.logger.warn(`Resource of namespace '${ns}' in language '${lng}' is empty`)
          } else {
            lazyloads.push({
              fn: lazyload,
              ns,
            })
          }
        })
      } else {
        // 用户未传入namespaces
        // 请求当前语言支持的所有的namespace
        this.supportedNs[lng].forEach((ns) => {
          const lazyload = resources[`${lng}${config.separator}${ns}`]
          if (!lazyload) {
            this.logger.warn(`Resource of namespace '${ns}' in language '${lng}' is empty`)
          } else {
            lazyloads.push({
              fn: lazyload,
              ns,
            })
          }
        })
      }
    } else {
      const lazyload = resources[lng]
      if (!lazyload) {
        this.logger.warn(`No locale resources found`)
      } else {
        lazyloads.push({
          fn: lazyload,
          ns: undefined,
        })
      }
    }

    if (lazyloads.length) {
      await Promise.all(
        lazyloads.map(async (lazyload) => {
          const resources = (await lazyload.fn()).default || null
          if (!resources) {
            this.logger.warn(`Resource of language '${lng}' is empty`)
            return
          }

          if (config.namespace && lazyload.ns) {
            this.loaded[lng] ||= new Set()
            this.loaded[lng].add(lazyload.ns)

            if (!this.loaded[fallbackLng]?.has(lazyload.ns)) {
              // 如果 fallback 的 namespace 未加载，加载 fallback 的 namespace
              this.loadResource(fallbackLng, { enableCache: false, ns: [lazyload.ns] })
            }
          }

          // inject resources to i18n library, eg. i18next
          await this.options.onResourceLoaded?.(resources, {
            lng: this.formatLngs(lng),
            ns: lazyload.ns,
          })
        }),
      )
    }

    enableCache && this.persistLng(this.formatLngs(lng))
  }

  private persistLng(lng: string) {
    const persistDetector = (this.options.detection as Detection[])?.filter((d) => d.cache !== false)

    if (!persistDetector?.length) return

    persistDetector.forEach(async (d) => {
      const detector = this.detectorMap.get(d.detect)
      detector?.persistLng?.(lng, {
        lookup: d.lookup || 'lng',
        ...omit(d, ['detect', 'lookup', 'cache']),
        lngs: this.lngs,
      })
    })
  }

  private warnFallback(lng: string) {
    if (lng !== this.fallbackLng) {
      this.logger.warn(`Current language '${lng}' not found in locale resources, fallback to '${this.fallbackLng}'`)
    }
  }

  private async init() {
    const { fallbackLng, ns } = this.options
    await this.loadResource(fallbackLng, { enableCache: false, ns })
    if (this.language !== fallbackLng) {
      await this.loadResource(this.language, { enableCache: false, ns })
    }
    this.options.detection && this.persistLng(this.language)
  }

  private generateDetectorMap() {
    const detectors = [...builtinDetectors, ...(this.options.customDetectors || [])] as Detector[]
    this.detectorMap = new Map<string, Detector>(detectors.map((detector) => [detector.name, detector]))
  }

  /**
   * @description Resolve current language from detector
   */
  private detect() {
    return detectLanguage(
      {
        fallbackLng: this.fallbackLng,
        lngs: this.lngs,
        detection: this.options.detection || [],
      },
      ({ lookup, detect }) => {
        const detector = this.detectorMap.get(detect)
        return this.formatLngs(detector?.resolveLng({ lookup, lngs: this.lngs }))
      },
    )
  }

  static getSupportedLngs() {
    return getSupportedLngs()
  }

  static getSupportedNs() {
    return getSupportedNs()
  }
}
