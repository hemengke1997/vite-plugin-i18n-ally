import { type I18nDetectorOptions } from '..'
import { I18nAllyVscodeSetting } from './I18nAllyVscodeSetting'
import { debug } from './debugger'

const DEFAULT_OPTIONS: I18nDetectorOptions = {
  localesPaths: ['./src/locales', './locales'],
  root: process.cwd(),
  namespace: false,
  autoDetectI18nConfig: true,
}

function getDefaultOptions(options?: I18nDetectorOptions): I18nDetectorOptions {
  if (options?.dotVscodePath !== undefined) {
    console.warn(`dotVscodePath is deprecated, please use 'root' instead`)
  }

  if (options?.autoDetectI18nConfig) {
    const stopAt = typeof options.autoDetectI18nConfig === 'object' ? options.autoDetectI18nConfig.stopAt : undefined
    const i18nAlly = new I18nAllyVscodeSetting(options?.root || (DEFAULT_OPTIONS.root as string), stopAt).init()

    debug('i18n-ally config:', i18nAlly)

    return {
      ...DEFAULT_OPTIONS,
      localesPaths: i18nAlly?.['localesPaths'] ?? DEFAULT_OPTIONS.localesPaths,
      pathMatcher: i18nAlly?.['pathMatcher'] ?? DEFAULT_OPTIONS.pathMatcher,
      namespace: i18nAlly?.['namespace'] ?? DEFAULT_OPTIONS.namespace,
    }
  }

  return DEFAULT_OPTIONS
}

export function initOptions(options?: I18nDetectorOptions) {
  return {
    ...getDefaultOptions(options),
    ...options,
  } as Required<I18nDetectorOptions>
}
