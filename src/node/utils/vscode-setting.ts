import { findUpSync } from 'find-up'
import JSON5 from 'json5'
import fs from 'node:fs'
import path from 'node:path'
import { debug } from './debugger'

export class VscodeSetting {
  static I18N_ALLY_KEY = 'i18n-ally.'
  static SETTING_FILE = '.vscode/settings.json'
  public i18nConfig: Record<string, any> | undefined

  constructor(
    private readonly _root: string,
    private readonly _stopAt: string | undefined,
  ) {
    debug('VscodeSetting - root:', _root)
    debug('VscodeSetting - stopAt:', _stopAt)
  }

  findUp() {
    const settingFile = findUpSync(VscodeSetting.SETTING_FILE, {
      type: 'file',
      cwd: this._root,
      stopAt: this._stopAt,
    })

    debug('findup - settingFile:', settingFile)
    return settingFile
  }

  init() {
    const settings = this.readJsonFile(this.findUp())

    if (settings) {
      const removePrefix = (key: string) => key.replace(VscodeSetting.I18N_ALLY_KEY, '')
      const filteredConfig = Object.keys(settings)
        .filter((key) => key.startsWith(VscodeSetting.I18N_ALLY_KEY))
        .reduce(
          (obj, key) => {
            if (key === `${VscodeSetting.I18N_ALLY_KEY}localesPaths`) {
              if (Array.isArray(settings[key])) {
                obj[removePrefix(key)] = settings[key].map((p: string) => path.resolve(this._root, p))
              }
            } else {
              obj[removePrefix(key)] = settings[key]
            }
            return obj
          },
          {} as Record<string, any>,
        )
      if (Object.keys(filteredConfig).length) {
        this.i18nConfig = filteredConfig
      }
    }
    return this.i18nConfig
  }

  readJsonFile(filePath: string | undefined) {
    if (filePath) {
      try {
        return JSON5.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }))
      } catch {
        return ''
      }
    }
    return ''
  }
}
