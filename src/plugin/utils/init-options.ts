import path from 'node:path'
import { type I18nDetectorOptions } from '..'

export const DEFAULT_OPTIONS: Required<I18nDetectorOptions> = {
  localesPaths: ['./src/locales', './locales'],
  pathMatcher: '{locale}/{namespaces}.{ext}',
  parserPlugins: [],
  root: process.cwd(),
}

export function initOptions(options?: I18nDetectorOptions) {
  if (!options) return DEFAULT_OPTIONS
  if (options.root) {
    if (!options.localesPaths?.length) {
      options.localesPaths = DEFAULT_OPTIONS.localesPaths.map((p) => path.resolve(options.root!, p))
    }
  } else {
    options.root = DEFAULT_OPTIONS.root
  }

  return {
    ...DEFAULT_OPTIONS,
    ...options,
  } as Required<I18nDetectorOptions>
}
