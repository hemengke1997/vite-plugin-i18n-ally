import { type Detections } from '@/utils/detect'
import { type Cookie, type CookieAttributes } from './detectors/cookie'
import { type HtmlTag } from './detectors/html-tag'
import { type LocalStorage } from './detectors/local-storage'
import { type Navigator } from './detectors/navigator'
import { type Path } from './detectors/path'
import { type QueryString } from './detectors/query-string'
import { type SessionStorage } from './detectors/session-storage'
import { type Detector } from './detectors/types'

type ResolveDetectorName<T extends Detector> = T['name']
type ResolveDetectorLookup<T extends Detector> = Parameters<T['resolveLng']>[0]['lookup']

export interface I18nAllyClientOptions<D extends Detector[] | undefined = undefined> {
  /**
   * @description
   * Specify language to use
   *
   * 指定当前使用的语言
   */
  lng?: string
  /**
   * @description
   * Specify languages to use
   *
   * 指定当前使用的语言列表。默认从vite插件中获取
   */
  lngs?: string[]
  /**
   * @description
   * Namespaces to load
   *
   * 指定当前使用的命名空间列表
   */
  ns?: string[]
  /**
   * @description
   * If no resource for current language, fallback to `fallbackLng`
   *
   * 如果当前语言没有资源，则回退到`fallbackLng`
   */
  fallbackLng: string
  /**
   * @description
   * Language will be lowercased eg. en-US --> en-us
   *
   * 是否将语言转换为小写字母
   * @default false
   */
  lowerCaseLng?: boolean
  /**
   * @description
   * Before i18n-ally is initialized
   *
   * i18n-ally初始化之前的回调
   */
  onBeforeInit?: (
    current: { lng: string; ns: string[] },
    all: {
      lngs: string[]
      ns: {
        [lng: string]: string[]
      }
    },
  ) => Promise<void> | void
  /**
   * @description
   * i18n-ally initialized
   *
   * i18n-ally初始化完成的回调
   */
  onInited?: (
    current: {
      lng: string
      ns: string[]
    },
    all: {
      lngs: string[]
      ns: {
        [lng: string]: string[]
      }
    },
  ) => Promise<void> | void
  /**
   * @description
   * resources loaded callback
   *
   * i18n 资源加载完成的回调
   */
  onResourceLoaded?: (
    resources: {
      [key in string]: string
    },
    current: {
      lng: string
      ns: string | undefined
    },
  ) => Promise<void> | void
  /**
   * @description
   * Detect and cache user language on html tag / querystring / cookie / localStorage / sessionStorage etc.
   *
   * Like `i18next-browser-languagedetector`
   *
   * The order of detection determines the priority of language detection. The earlier it appears, the higher the priority.
   *
   * 探测和缓存用户语言的方式，支持html标签、查询字符串、cookie、本地存储、会话存储等
   *
   * 和`i18next-browser-languagedetector`类似
   * 数组顺序决定了语言探测的优先级，越前的优先级越高
   */
  detection?: Detections<
    | {
        detect: ResolveDetectorName<HtmlTag>
        lookup?: ResolveDetectorLookup<HtmlTag>
        cache?: boolean
      }
    | {
        detect: ResolveDetectorName<QueryString>
        lookup?: ResolveDetectorLookup<QueryString>
        cache?: boolean
      }
    | {
        detect: ResolveDetectorName<Cookie>
        lookup?: ResolveDetectorLookup<Cookie>
        cache?: boolean
        attributes?: CookieAttributes
      }
    | {
        detect: ResolveDetectorName<LocalStorage>
        lookup?: ResolveDetectorLookup<LocalStorage>
        cache?: boolean
      }
    | {
        detect: ResolveDetectorName<SessionStorage>
        lookup?: ResolveDetectorLookup<SessionStorage>
        cache?: boolean
      }
    | {
        detect: ResolveDetectorName<Navigator>
      }
    | {
        detect: ResolveDetectorName<Path>
        /**
         * @description
         * The path index to get language
         *
         * 路径中获取语言的索引
         *
         * @example
         * '/en-US/...' => 0
         * '/prefix/en-US' => 1
         */
        lookup?: ResolveDetectorLookup<Path>
        cache?: boolean
      },
    D extends Detector[]
      ? {
          detect: ResolveDetectorName<D[number]>
          lookup?: ResolveDetectorLookup<D[number]>
          cache?: boolean
        }
      : undefined,
    D
  >[]
  /**
   * @description
   * Custom detectors
   *
   * 自定义探测器
   */
  customDetectors?: D
}
