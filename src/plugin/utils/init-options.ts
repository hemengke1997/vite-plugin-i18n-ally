import { type I18nAllyOptions } from '..'
import { I18nAllyVscodeSetting } from './I18nAllyVscodeSetting'
import { debug } from './debugger'

const DEFAULT_OPTIONS: I18nAllyOptions = {
  localesPaths: ['./src/locales', './locales'],
  root: process.cwd(),
  namespace: false,
  useVscodeI18nAllyConfig: true,
}

function getDefaultOptions(options?: I18nAllyOptions): I18nAllyOptions {
  if (options?.dotVscodePath !== undefined) {
    console.warn(`dotVscodePath is deprecated, please use 'root' instead`)
  }

  if (options?.useVscodeI18nAllyConfig) {
    const stopAt =
      typeof options.useVscodeI18nAllyConfig === 'object' ? options.useVscodeI18nAllyConfig.stopAt : undefined
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

export function initOptions(options?: I18nAllyOptions) {
  return {
    ...getDefaultOptions({
      ...DEFAULT_OPTIONS,
      ...options,
    }),
    ...options,
  } as Required<I18nAllyOptions>
}
