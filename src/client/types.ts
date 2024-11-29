import { type CookieAttributes } from './detectors/cookie'

export interface I18nSetupOptions {
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
      namespace: string
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
  detection?: (
    | {
        detect: 'htmlTag'
        lookup?: string
        cache?: boolean
      }
    | {
        detect: 'querystring'
        lookup?: string
        cache?: boolean
      }
    | {
        detect: 'cookie'
        lookup?: string
        cache?: boolean
        attributes?: CookieAttributes
      }
    | {
        detect: 'localStorage'
        cache?: boolean
        lookup?: string
      }
    | {
        detect: 'sessionStorage'
        cache?: boolean
        lookup?: string
      }
    | {
        detect: 'navigator'
      }
    | {
        detect: 'path'
        /**
         * The path index to get language
         * @example
         * '/en-US/...' => 0
         * '/prefix/en-US' => 1
         */
        lookup?: number
        cache?: boolean
      }
  )[]
}
