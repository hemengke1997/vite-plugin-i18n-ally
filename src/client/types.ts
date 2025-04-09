import { type Cookie, type CookieAttributes } from './detectors/cookie'
import { type HtmlTag } from './detectors/html-tag'
import { type LocalStorage } from './detectors/local-storage'
import { type Navigator } from './detectors/navigator'
import { type Path } from './detectors/path'
import { type QueryString } from './detectors/query-string'
import { type SessionStorage } from './detectors/session-storage'
import { type Detector } from './detectors/types'

type ResolveDetectorName<T extends Detector> = T['name']
type ResolveDetectorLookup<T extends Detector> = Parameters<T['resolveLanguage']>[0]['lookup']

type Detections<T, U, D> = D extends undefined ? T : T | U

export interface I18nAllyClientOptions<D extends Detector[] | undefined = undefined> {
  /**
   * Current language
   */
  language?: string
  /**
   * Namespaces to load
   */
  namespaces?: string[]
  /**
   * If no resource for current language, fallback to `fallbackLng`
   */
  fallbackLng: string
  /**
   * Language will be lowercased eg. en-US --> en-us
   * @default false
   */
  lowerCaseLng?: boolean
  onInit?: (
    current: { language: string; namespaces: string[] },
    all: {
      languages: string[]
      namespaces: {
        [lang: string]: string[]
      }
    },
  ) => Promise<void> | void
  /**
   * Triggered when i18n-ally is inited
   */
  onInited?: (
    current: {
      language: string
      namespaces: string[]
    },
    all: {
      languages: string[]
      namespaces: {
        [lang: string]: string[]
      }
    },
  ) => Promise<void> | void
  /**
   * Triggered when resource is loaded first time
   */
  onResourceLoaded: (
    resources: {
      [key in string]: string
    },
    current: {
      language: string
      namespace: string | undefined
    },
  ) => Promise<void> | void
  /**
   * Detect and cache user language on html tag / querystring / cookie / localStorage / sessionStorage etc.
   *
   * Like `i18next-browser-languagedetector`
   *
   * The order of detection determines the priority of language detection. The earlier it appears, the higher the priority.
   *
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
         * The path index to get language
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
   * Custom detectors
   */
  customDetectors?: D
}
