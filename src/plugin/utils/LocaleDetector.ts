import path from 'path'
import { uniq } from '@minko-fe/lodash-pro'
import fg from 'fast-glob'
import type { DetectI18nResourceOptions } from '..'
import { logger } from './logger'

export interface Config extends DetectI18nResourceOptions {
  cwd: string
  pathMatcher: RegExp
}

export class LocaleDetector {
  private config: Config
  private localeDirs: string[] = []

  constructor(c: Config) {
    this.config = c
  }

  getConfig() {
    return this.config
  }

  setConfig(c: Config) {
    this.config = Object.assign(this.config, c)
    return this
  }

  getLocaleDirs() {
    return this.localeDirs
  }

  async findLocaleDirs() {
    const { localesPaths } = this.config
    if (localesPaths?.length) {
      try {
        const _locale_dirs = await fg(localesPaths, {
          cwd: this.config.cwd,
          onlyDirectories: true,
        })

        if (localesPaths.includes('.')) {
          _locale_dirs.push('.')
        }

        this.localeDirs = uniq(_locale_dirs.map((p) => path.resolve(this.config.cwd, p)))
      } catch (e: any) {
        logger.error(e.message)
      }
    }
    if (this.localeDirs.length === 0) {
      logger.info('\n⚠ No locales paths.')
      return false
    }

    return true
  }
}
