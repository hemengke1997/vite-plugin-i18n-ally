import { type I18nAllyOptions } from '../types'
import { debug } from './debugger'
import { VscodeSetting } from './vscode-setting'

const DEFAULT_OPTIONS: I18nAllyOptions = {
  root: process.cwd(),
  useVscodeI18nAllyConfig: true,
}

function resolveI18nAlly(options?: I18nAllyOptions): {
  options: I18nAllyOptions
  vscodeSetting?: VscodeSetting
} {
  if (options?.useVscodeI18nAllyConfig) {
    return initVscodeSetting(options)
  }

  return {
    options: {
      ...options,
    },
  }
}

function initVscodeSetting(options: I18nAllyOptions) {
  const stopAt =
    typeof options.useVscodeI18nAllyConfig === 'object' ? options.useVscodeI18nAllyConfig.stopAt : undefined

  const vscodeSetting = new VscodeSetting(options?.root || (DEFAULT_OPTIONS.root as string), stopAt)
  const i18nAlly = vscodeSetting.init()

  debug('I18n-ally config:', i18nAlly)

  return {
    options: {
      ...options,
      localesPaths: (options.localesPaths ?? i18nAlly?.['localesPaths']) || [],
      pathMatcher: (options.pathMatcher ?? i18nAlly?.['pathMatcher']) || '',
      namespace: (options.namespace ?? i18nAlly?.['namespace']) || false,
    },
    vscodeSetting,
  }
}

export function initI18nAlly(options?: I18nAllyOptions): {
  options: Required<I18nAllyOptions>
  vscodeSetting?: VscodeSetting
} {
  debug('User input i18n-ally options:', options)
  return resolveI18nAlly({
    ...DEFAULT_OPTIONS,
    ...options,
  }) as {
    options: Required<I18nAllyOptions>
    vscodeSetting?: VscodeSetting
  }
}
