import { type I18nDetectorOptions } from '..'
import { getI18nAllyConfigByKey, readI18nAllyConfig } from './vscode-settings'

const DEFAULT_OPTIONS: I18nDetectorOptions = {
  localesPaths: ['./src/locales', './locales'],
  root: process.cwd(),
  namespace: false,
  dotVscodePath: process.cwd(),
}

function getDefaultOptions(options?: I18nDetectorOptions): I18nDetectorOptions {
  let i18AllyConfig: Record<string, any> | undefined = undefined
  if (options?.dotVscodePath !== false) {
    // detect vscode settings of i18n-ally
    i18AllyConfig = readI18nAllyConfig(options?.dotVscodePath || (DEFAULT_OPTIONS.dotVscodePath as string))
  }

  if (i18AllyConfig) {
    return {
      localesPaths: getI18nAllyConfigByKey(i18AllyConfig, 'localesPaths') ?? DEFAULT_OPTIONS.localesPaths,
      pathMatcher: getI18nAllyConfigByKey(i18AllyConfig, 'pathMatcher'),
      namespace: getI18nAllyConfigByKey(i18AllyConfig, 'namespace') ?? DEFAULT_OPTIONS.namespace,
      ...DEFAULT_OPTIONS,
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
