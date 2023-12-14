import { findUpSync } from 'find-up'
import JSON5 from 'json5'
import fs from 'node:fs'

const SETTING_FILE = '.vscode/settings.json'

export function findupVscodeSettings(cwd?: string) {
  const settingFile = findUpSync(SETTING_FILE, {
    type: 'file',
    cwd,
    // TODO: user custom
    stopAt: '.git',
  })

  return settingFile
}

export function readFile(filePath?: string) {
  if (filePath) {
    return JSON5.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }))
  }
  return ''
}

export const I18N_ALLY_KEY = 'i18n-ally.'

export function readI18nAllyConfig(cwd?: string) {
  const filePath = findupVscodeSettings(cwd)
  const settings = readFile(filePath)
  if (settings) {
    const filteredConfig = Object.keys(settings)
      .filter((key) => key.startsWith(I18N_ALLY_KEY))
      .reduce(
        (obj, key) => {
          obj[key] = settings[key]
          return obj
        },
        {} as Record<string, any>,
      )
    if (Object.keys(filteredConfig).length) {
      return {
        ...filteredConfig,
        i18nRootPath: filePath?.replace(new RegExp(`${SETTING_FILE}$`), '') ?? '',
      }
    }
  }
  return undefined
}

export function getI18nAllyConfigByKey(config: Record<string, any>, key: string) {
  return config[`${I18N_ALLY_KEY}${key}`]
}
