import fs from 'node:fs'
import path from 'node:path'
import { diff } from 'deep-object-diff'
import { findUpSync } from 'find-up'
import JSON5 from 'json5'
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

    this.previousConfig = this.readJsonFile(this.findUp())
  }

  private previousConfig: Record<string, any> | undefined = undefined

  findUp() {
    const settingFile = findUpSync(VscodeSetting.SETTING_FILE, {
      type: 'file',
      cwd: this._root,
      stopAt: this._stopAt,
    })

    return settingFile
  }

  isChanged() {
    const settingFile = this.findUp()
    const currentConfig = this.readJsonFile(settingFile)

    let isChanged = false
    if (currentConfig) {
      const res = diff(this.previousConfig || {}, currentConfig)
      if (Object.keys(res).some(key => key.startsWith(VscodeSetting.I18N_ALLY_KEY))) {
        isChanged = true
      }
    }

    this.previousConfig = currentConfig

    return isChanged
  }

  init() {
    const settingFile = this.findUp()
    debug('findup - settingFile:', settingFile)

    const settings = this.readJsonFile(this.findUp())

    if (settings) {
      const removePrefix = (key: string) => key.replace(VscodeSetting.I18N_ALLY_KEY, '')
      const filteredConfig = Object.keys(settings)
        .filter(key => key.startsWith(VscodeSetting.I18N_ALLY_KEY))
        .reduce(
          (obj, key) => {
            if (key === `${VscodeSetting.I18N_ALLY_KEY}localesPaths`) {
              if (Array.isArray(settings[key])) {
                obj[removePrefix(key)] = settings[key].map((p: string) => path.resolve(this._root, p))
              }
            }
            else {
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
      }
      catch {
        return {}
      }
    }
    return {}
  }
}
