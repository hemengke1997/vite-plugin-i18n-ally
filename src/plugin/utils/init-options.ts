import path from 'node:path'
import { type I18nDetectorOptions } from '..'
import { getI18nAllyConfigByKey, readI18nAllyConfig } from './vscode-settings'

const DEFAULT_OPTIONS: Required<I18nDetectorOptions> = {
  localesPaths: ['./src/locales', './locales'],
  pathMatcher: '',
  parserPlugins: [],
  root: process.cwd(),
  namespace: false,
}

function getDefaultOptions(root: string): Required<I18nDetectorOptions> {
  const i18AllyConfig = readI18nAllyConfig(root)
  if (i18AllyConfig) {
    let localesPaths = getI18nAllyConfigByKey(i18AllyConfig, 'localesPaths')

    if (Array.isArray(localesPaths)) {
      localesPaths = localesPaths.map((p) => {
        if (process.env.E2E) {
          p = p.replace('playground', 'playground-temp')
        }
        return path.resolve(i18AllyConfig.i18nRootPath, p)
      })
    }

    return {
      localesPaths: localesPaths ?? DEFAULT_OPTIONS.localesPaths,
      pathMatcher: getI18nAllyConfigByKey(i18AllyConfig, 'pathMatcher') ?? DEFAULT_OPTIONS.pathMatcher,
      namespace: getI18nAllyConfigByKey(i18AllyConfig, 'namespace') ?? DEFAULT_OPTIONS.namespace,
      root: DEFAULT_OPTIONS.root,
      parserPlugins: DEFAULT_OPTIONS.parserPlugins,
    }
  }
  return DEFAULT_OPTIONS
}

export function initOptions(options?: I18nDetectorOptions) {
  if (!options) {
    return getDefaultOptions(DEFAULT_OPTIONS.root)
  }

  return {
    ...getDefaultOptions(options.root ?? DEFAULT_OPTIONS.root),
    ...options,
  } as Required<I18nDetectorOptions>
}
