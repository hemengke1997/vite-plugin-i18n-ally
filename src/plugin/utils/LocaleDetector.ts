import path from 'path'
import { trimEnd, uniq } from '@minko-fe/lodash-pro'
import fg from 'fast-glob'
import { normalizePath } from 'vite'
import cloneDeep from 'clone-deep'
import type { DetectI18nResourceOptions } from '..'
import { AvailableParsers, DefaultEnabledParsers } from '../parsers'
import { logger } from './logger'
import { ParsePathMatcher } from './PathMatcher'
import { VIRTUAL } from './constant'

export interface Config extends DetectI18nResourceOptions {
  cwd: string
}

type PathMatcherType = RegExp

export interface FileInfo {
  filepath: string
  dirpath: string
  locale: string
  namespace?: string
  matcher?: string
}

export interface ParsedFile extends FileInfo {
  value: object
}

export class LocaleDetector {
  readonly config: Config
  private _files: Record<string, ParsedFile> = {}
  private _localeDirs: string[] = []
  private _pathMatcher: { regex: PathMatcherType; matcher: string }
  private _localesPaths: string[]
  private _rootPath: string

  constructor(c: Config) {
    this.config = c

    this._rootPath = c.cwd
    const pathMatcher = this.normalizeMatcher(c.pathMatcher)
    this._pathMatcher = {
      regex: ParsePathMatcher(pathMatcher, this.enabledParserExts()),
      matcher: pathMatcher,
    }

    this._localesPaths = c.localesPaths.map((item) => trimEnd(normalizePath(item), '/\\').replace(/\\/g, '/'))
  }

  async init() {
    if (await this.findLocaleDirs()) {
      logger.info(`🚀 Initializing loader "${this._rootPath}"`)

      logger.info(`🗃 Custom Path Matcher: ${this._pathMatcher.matcher}`)

      logger.info(`🗃 Path Matcher Regex: ${this._pathMatcher.regex}`)
      await this.loadAll()
    }

    logger.info('✅ Loading finished\n')
    return this.moduleLocale()
  }

  private moduleLocale() {
    const modules: Record<string, any> = {}
    this.files.forEach((file) => {
      const keyArray = [file.locale, file.namespace].filter(Boolean) as string[]
      keyArray.reduce((current, key, i) => {
        if (!current[key]) {
          current[key] = {}
        }
        if (i === keyArray.length - 1) {
          current[key] = {
            ...current[key],
            ...file.value,
          }
        }
        return current[key]
      }, modules)
    })

    const resolvedIds = new Map<string, string>()

    const virtualModules = cloneDeep(modules)

    Object.keys(virtualModules).forEach((k) => {
      const id = `${VIRTUAL}-${k}`
      virtualModules[id] = virtualModules[k]
      resolvedIds.set(path.resolve(id), id)
      delete virtualModules[k]
    })

    return {
      modules,
      virtualModules,
      resolvedIds,
    }
  }

  get files() {
    return Object.values(this._files)
  }

  private async loadAll() {
    for (const pathname of this._localeDirs) {
      try {
        logger.info(`\n📂 Loading locales under ${pathname}`)
        await this.loadDirectory(pathname)

        if (!this.files.length) {
          logger.info(`\n💥 No locale files detected in: ${pathname}`)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  private async loadDirectory(searchingPath: string) {
    const files = await fg('**/*.*', {
      cwd: searchingPath,
      onlyFiles: true,
      ignore: ['node_modules/**'],
      deep: 2,
    })

    for (const relative of files) {
      await this.loadFile(searchingPath, relative)
    }
  }

  private async loadFile(dirpath: string, relativePath: string) {
    try {
      const result = this.getFileInfo(dirpath, relativePath)
      if (!result) {
        return
      }
      const { locale, parser, namespace, fullpath: filepath, matcher } = result
      if (!parser) {
        return
      }
      if (!locale) {
        return
      }

      logger.info(`📑 Loading (${locale}) ${relativePath}`)

      const data = await parser.load(filepath)

      this._files[filepath] = {
        filepath,
        dirpath,
        locale,
        value: data,
        namespace,
        matcher,
      }

      return true
    } catch (e) {
      this.unsetFile(relativePath)
      logger.info(`🐛 Failed to load ${e}`)
      console.error(e)
    }
  }

  private unsetFile(filepath: string) {
    delete this._files[filepath]
  }

  private getFileInfo(dirpath: string, relativePath: string) {
    const fullpath = path.resolve(dirpath, relativePath)
    const ext = path.extname(relativePath)

    let match: RegExpExecArray | null = null
    let matcher: string | undefined

    match = this._pathMatcher.regex.exec(relativePath)
    if (match && match.length > 0) {
      matcher = this._pathMatcher.matcher
    }

    if (!match || match.length < 1) {
      return
    }

    let namespace = match.groups?.namespace
    if (namespace) {
      namespace = namespace.replace(/\//g, '.')
    }

    let locale = match.groups?.locale

    if (!locale) {
      locale = 'en' // todo
    }

    if (!locale) {
      return
    }

    const parser = this.getMatchedParser(ext)

    return {
      locale,
      parser,
      ext,
      namespace,
      fullpath,
      matcher,
    }
  }

  getMatchedParser(ext: string) {
    if (!ext.startsWith('.') && ext.includes('.')) {
      ext = path.extname(ext)
    }

    // resolve parser
    return this.getEnabledParsers().find((parser) => parser.supports(ext))
  }

  private normalizeMatcher(matcher: string) {
    return matcher.endsWith('{ext}') ? matcher : `${matcher}.{ext}`
  }

  private enabledParserExts() {
    const enabledParsers = this.getEnabledParsers().map((item) => item.id)
    return enabledParsers.filter(Boolean).join('|')
  }

  getEnabledParsers() {
    let ids = this.config.enabledParsers

    if (!ids.length) {
      ids = DefaultEnabledParsers
    }

    return AvailableParsers.filter((i) => ids.includes(i.id))
  }

  getPathMatcher() {
    return this._pathMatcher
  }

  getLocaleDirs() {
    return this._localeDirs
  }

  async findLocaleDirs() {
    if (this._localesPaths?.length) {
      try {
        const _locale_dirs = await fg(this._localesPaths, {
          cwd: this._rootPath,
          onlyDirectories: true,
        })

        if (this._localesPaths.includes('.')) {
          _locale_dirs.push('.')
        }

        this._localeDirs = uniq(_locale_dirs.map((p) => path.resolve(this._rootPath, p)))
      } catch (e: any) {
        logger.error(e.message)
      }
    }
    if (this._localeDirs.length === 0) {
      logger.info('\n⚠ No locales paths.')
      return false
    }

    return true
  }
}
