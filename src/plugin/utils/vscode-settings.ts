import { findUpSync } from 'find-up'
import JSON5 from 'json5'
import fs from 'node:fs'
import path from 'node:path'

export const SETTING_FILE = '.vscode/settings.json'

// TODO: need auto findup? or user custom?
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

export function readI18nAllyConfig(dotVscodePath: string) {
  const settings = readFile(path.resolve(dotVscodePath, SETTING_FILE))

  if (settings) {
    const filteredConfig = Object.keys(settings)
      .filter((key) => key.startsWith(I18N_ALLY_KEY))
      .reduce(
        (obj, key) => {
          if (key === `${I18N_ALLY_KEY}localesPaths`) {
            if (Array.isArray(settings[key])) {
              obj[key] = settings[key].map((p: string) => path.resolve(dotVscodePath, p))
            }
          } else {
            obj[key] = settings[key]
          }
          return obj
        },
        {} as Record<string, any>,
      )
    if (Object.keys(filteredConfig).length) {
      return filteredConfig
    }
  }
  return undefined
}

export function getI18nAllyConfigByKey(config: Record<string, any>, key: string) {
  return config[`${I18N_ALLY_KEY}${key}`]
}
