import path from 'path'
import trimEnd from 'string.prototype.trimend'
import uniq from 'uniq'
import fg from 'fast-glob'
import { normalizePath } from 'vite'
import cloneDeep from 'clone-deep'
import type { DetectI18nResourceOptions } from '..'
import { AvailableParsers, DefaultEnabledParsers } from '../parsers'
import { ParsePathMatcher } from './PathMatcher'
import { PKGNAME, VIRTUAL } from './constant'
import { debug } from './debugger'
import { logger } from './logger'

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

  private _localeModules: {
    modules: Record<string, any>
    virtualModules: Record<string, any>
    resolvedIds: Map<string, string>
  } = { modules: {}, virtualModules: {}, resolvedIds: new Map() }

  constructor(c: Config) {
    this.config = c

    this._rootPath = c.cwd
    const pathMatcher = c.pathMatcher
    this._pathMatcher = {
      regex: ParsePathMatcher(pathMatcher, this.enabledParserExts()),
      matcher: pathMatcher,
    }

    this._localesPaths = c.localesPaths.map((item) =>
      trimEnd(normalizePath(path.isAbsolute(item) ? item : path.resolve(this._rootPath, item)), '/\\').replace(
        /\\/g,
        '/',
      ),
    )
  }

  async init() {
    if (await this.findLocaleDirs()) {
      debug(`🚀 Initializing loader "${this._rootPath}"`)
      debug(`🗃 Custom Path Matcher: ${this._pathMatcher.matcher}`)
      debug(`🗃 Path Matcher Regex: ${this._pathMatcher.regex}`)
      await this.loadAll()
    }

    this.update()
  }

  private update() {
    debug('✅ Loading finished')
    this.moduleLocale()
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

    this._localeModules = {
      modules,
      virtualModules,
      resolvedIds,
    }

    debug('📦 Module locale updated', this._localeModules)
  }

  get localeModules() {
    return this._localeModules
  }

  async onFileChanged({ fsPath: filepath }: { fsPath: string }) {
    filepath = path.resolve(filepath)

    const { dirpath, relative } = this.getRelativePath(filepath) || {}
    if (!dirpath || !relative) {
      return
    }

    debug(`🔄 File changed  ${relative} ${dirpath}`)

    return this.lazyLoadFile(dirpath, relative)
  }

  private loadFileWaitingList: [string, string][] = []

  private loadFileExecutor = async () => {
    const list = this.loadFileWaitingList
    this.loadFileWaitingList = []
    if (list.length) {
      let changed = false
      for (const [d, r] of list) changed = (await this.loadFile(d, r)) || changed

      if (changed) {
        this.update()
        return true
      }
    }
    return false
  }

  private lazyLoadFile = async (d: string, r: string) => {
    if (!this.loadFileWaitingList.find(([a, b]) => a === d && b === r)) {
      this.loadFileWaitingList.push([d, r])
    }
    const updated = await this.loadFileExecutor()

    return updated
  }

  private getRelativePath(filepath: string) {
    let dirpath = this._localeDirs.find((dir) => filepath.startsWith(dir))
    if (!dirpath) {
      return
    }

    let relative = path.relative(dirpath, filepath)

    if (process.platform === 'win32') {
      relative = relative.replace(/\\/g, '/')
      dirpath = dirpath.replace(/\\/g, '/')
    }

    return { dirpath, relative }
  }

  get files() {
    return Object.values(this._files)
  }

  private async loadAll() {
    for (const pathname of this._localeDirs) {
      try {
        debug(`📂 Loading locales under ${pathname}`)
        await this.loadDirectory(pathname)
      } catch (e) {
        console.error(e)
      }
    }
    if (!this.files.length) {
      throw new Error(`[${PKGNAME}]: No locale files detected. Please check your config.`)
    }
  }

  private async loadDirectory(searchingPath: string) {
    const files = await fg('**/*.*', {
      cwd: searchingPath,
      onlyFiles: true,
      ignore: ['node_modules/**'],
      deep: 2, // todo
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

      debug(`📑 Loading (${locale}) ${relativePath}`)

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
      debug(`🐛 Failed to load ${e}`)
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

  private enabledParserExts() {
    const enabledParsers = this.getEnabledParsers().map((item) => item.id)
    return enabledParsers.filter(Boolean).join('|')
  }

  getEnabledParsers() {
    let ids = this.config.enabledParsers

    if (!ids?.length) {
      ids = DefaultEnabledParsers
    }

    return AvailableParsers.filter((i) => ids!.includes(i.id))
  }

  get pathMatcher() {
    return this._pathMatcher
  }

  get localeDirs() {
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
      } catch (e) {
        console.error(e)
      }
    }
    if (this._localeDirs.length === 0) {
      logger.info('\n⚠ No locales paths.')
      return false
    }

    return true
  }
}
