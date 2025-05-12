import { cloneDeep, throttle, trimEnd, uniq } from 'es-toolkit'
import fg from 'fast-glob'
import tags from 'language-tags'
import fs from 'node:fs'
import path from 'node:path'
import { type ChangeEvent } from 'rollup'
import { normalizePath } from 'vite'
import { DefaultEnabledParsers } from '../parsers'
import { Parser } from '../parsers/Parser'
import { ParsePathMatcher } from '../path-matcher'
import { type I18nAllyOptions } from '../types'
import { debug } from '../utils/debugger'
import { unflatten } from '../utils/flat'
import { logger } from '../utils/logger'
import { VirtualModule } from '../utils/virtual'

const THROTTLE_DELAY = 1500

export type Config = Omit<Required<I18nAllyOptions>, 'useVscodeI18nAllyConfig'>

type PathMatcherType = RegExp

type DirStructure = 'file' | 'dir'

export interface FileInfo {
  filepath: string
  deepDirpath: string
  dirpath: string
  locale: string
  mtime: number
  namespace?: string
  matcher?: string
}

export interface ParsedFile extends FileInfo {
  value: Record<string, any>
}

export class LocaleDetector {
  readonly config: Config
  private _dirStructure: DirStructure = 'file'
  private _pathMatcher: { regex: PathMatcherType; matcher: string } | undefined
  private _localesPaths: string[]
  private _rootPath: string
  private _namespace: boolean

  public separator = '__'

  private _localeDirs: string[] = []
  private _files: Record<string, ParsedFile> = {}
  private _localeModules: {
    modules: Record<string, any>
    modulesWithNamespace: Record<string, any>
    virtualModules: Record<string, any>
    resolvedIds: Map<string, string>
  } = { modules: {}, modulesWithNamespace: {}, virtualModules: {}, resolvedIds: new Map() }

  constructor(c: Config) {
    this.config = c
    this._rootPath = c.root
    this._namespace = c.namespace
    const pathMatcher = c.pathMatcher
    if (pathMatcher) {
      this._pathMatcher = {
        regex: ParsePathMatcher(pathMatcher, this.enabledParserExts()),
        matcher: pathMatcher,
      }
    }

    this._localesPaths = c.localesPaths.map((item) =>
      trimEnd(normalizePath(path.isAbsolute(item) ? item : path.resolve(this._rootPath, item)), '/\\').replaceAll(
        '\\',
        '/',
      ),
    )
  }

  async init() {
    if (await this.findLocaleDirs()) {
      debug(`Initializing loader "${this._rootPath}"`)

      if (this._pathMatcher) {
        debug(`Custom Path Matcher: ${this._pathMatcher.matcher}`)
        debug(`Path Matcher Regex: ${this._pathMatcher.regex}`)
      } else {
        const pathMatcherGussed = await this.resolvePathMatcherByDirStructure()
        this._pathMatcher = {
          regex: ParsePathMatcher(pathMatcherGussed, this.enabledParserExts()),
          matcher: pathMatcherGussed,
        }
        debug(`Path Matcher: ${this._pathMatcher.matcher}`)
      }

      debug(`\nLocale Detector options: `, {
        root: this._rootPath,
        localesPaths: this._localesPaths,
        pathMatcher: this._pathMatcher.matcher,
        parserPlugins: this.getParsers(),
        namespace: this._namespace,
      })

      await this.loadAll()
    }

    this.update()
  }

  private update() {
    debug('Loading finished')
    this.updateLocaleModule()
  }

  private updateLocaleModule() {
    const modules: Record<string, any> = {}
    const modulesWithNamespace: Record<string, any> = {}
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

    if (this._namespace) {
      Object.keys(modules).forEach((locale) => {
        const value = modules[locale]
        Object.keys(value).forEach((namespace) => {
          const key = `${locale}${this.separator}${namespace}`
          modulesWithNamespace[key] = value[namespace]
        })
      })
    }

    const resolvedIds = new Map<string, string>()

    const virtualModules = cloneDeep({
      ...modules,
      ...modulesWithNamespace,
    })

    Object.keys(virtualModules).forEach((k) => {
      const id = VirtualModule.id(k)
      virtualModules[id] = virtualModules[k]
      resolvedIds.set(id, id)
      delete virtualModules[k]
    })

    this._localeModules = {
      modules,
      modulesWithNamespace,
      virtualModules,
      resolvedIds,
    }
  }

  get localeModules() {
    return this._localeModules
  }

  get allLocaleDirs() {
    return new Set(this.files.map((t) => t.deepDirpath))
  }

  get allLocaleFiles() {
    return new Set(this.files.map((t) => t.filepath))
  }

  async onFileChanged(event: ChangeEvent, { fsPath: filepath }: { fsPath: string }) {
    filepath = path.resolve(filepath)

    // not tracking
    if (event !== 'create' && !this._files[filepath]) {
      return
    }

    // already up-to-date
    if (event !== 'update' && this._files[filepath]?.mtime === this.getMtime(filepath)) {
      debug(`Skipped on loading "${filepath}" (same mtime)`)
      return
    }

    const { dirpath, relative } = this.getRelativePath(filepath) || {}

    if (!dirpath || !relative) {
      return
    }

    debug(`File changed (${event}) ${relative}`)

    switch (event) {
      case 'delete':
        this.unsetFile(filepath)
        this.throttledUpdate()
        break
      case 'create':
      case 'update':
        this.throttledLoadFile(dirpath, relative)
        break
    }

    return relative
  }

  private throttledUpdate = throttle(() => {
    this.update()
  }, THROTTLE_DELAY)

  private throttledLoadFileWaitingList: [string, string][] = []

  private throttledLoadFileExecutor = throttle(async () => {
    const list = this.throttledLoadFileWaitingList
    this.throttledLoadFileWaitingList = []
    if (list.length) {
      let changed = false
      for (const [d, r] of list) changed = (await this.loadFile(d, r)) || changed

      if (changed) this.update()
    }
  }, THROTTLE_DELAY)

  private throttledLoadFile = (d: string, r: string) => {
    if (!this.throttledLoadFileWaitingList.find(([a, b]) => a === d && b === r))
      this.throttledLoadFileWaitingList.push([d, r])
    this.throttledLoadFileExecutor()
  }

  private getRelativePath(filepath: string) {
    let dirpath = this._localeDirs.find((dir) => filepath.startsWith(dir))
    if (!dirpath) {
      return
    }

    let relative = path.relative(dirpath, filepath)

    if (process.platform === 'win32') {
      relative = relative.replaceAll('\\', '/')
      dirpath = dirpath.replaceAll('\\', '/')
    }

    return { dirpath, relative }
  }

  get files() {
    return Object.values(this._files)
  }

  private async loadAll() {
    for (const pathname of this._localeDirs) {
      try {
        debug(`Loading locales under ${pathname}`)
        await this.loadDirectory(pathname)
      } catch (e) {
        console.error(e)
      }
    }
    if (!this.files.length) {
      logger.warn(`No locale files detected.\n`, {
        timestamp: true,
      })
    }
  }

  private async loadDirectory(searchingPath: string) {
    const files = await fg('**/*.*', {
      cwd: searchingPath,
      onlyFiles: true,
      ignore: ['node_modules/**'],
      deep: undefined,
    })

    debug(`📂 Loading ${files.length} files under ${searchingPath}`)

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

      const mtime = this.getMtime(filepath)

      debug(`📑 Loading (${locale}) ${relativePath} [${mtime}]`)

      const data = await parser.load(filepath)

      // support `i18n-ally.keyStyle` both `nesetd` and `flat`
      const value = unflatten(data)

      const deepDirpath = path.dirname(filepath)

      this._files[filepath] = {
        filepath,
        deepDirpath,
        dirpath,
        locale,
        mtime,
        value,
        namespace,
        matcher,
      }

      return true
    } catch (e) {
      this.unsetFile(relativePath)
      debug(`Failed to load ${e}`)
      console.error(e)
    }
  }

  private unsetFile(filepath: string) {
    delete this._files[filepath]
  }

  private getFileInfo(dirpath: string, relativePath: string) {
    const fullpath = path.resolve(dirpath, relativePath)

    debug(`Full path: ${fullpath}`)
    const ext = path.extname(relativePath)

    let match: RegExpExecArray | null = null
    let matcher: string | undefined

    match = this._pathMatcher!.regex.exec(relativePath)

    if (match && match.length > 0) {
      matcher = this._pathMatcher!.matcher
    }

    if (!match || match.length < 1) {
      return
    }

    debug(`Path Match:`, match)

    let namespace = match.groups?.namespace
    if (namespace) {
      namespace = namespace.replaceAll('/', '.')
    }

    const locale = match.groups?.locale

    if (!locale) {
      return
    }

    const parser = this.getMatchedParser(ext)

    const result = {
      locale,
      parser,
      ext,
      namespace,
      fullpath,
      matcher,
    }

    return result
  }

  private getMatchedParser(ext: string) {
    if (!ext.startsWith('.') && ext.includes('.')) {
      ext = path.extname(ext)
    }

    // resolve parser
    return this.getParsers().find((parser) => parser.supports(ext))
  }

  private enabledParserExts() {
    return this.getParsers()
      .map((item) => item.ext)
      .filter(Boolean)
      .join('|')
  }

  private getParsers() {
    const _parsers = this.config.parserPlugins?.filter(Boolean)

    const parsers = DefaultEnabledParsers
    if (_parsers?.length) {
      parsers.push(..._parsers.filter(Boolean).map((parser) => new Parser(parser!)))
    }

    return parsers
  }

  get pathMatcher() {
    return this._pathMatcher
  }

  get localeDirs() {
    return this._localeDirs
  }

  private getMtime(filepath: string) {
    try {
      return fs.statSync(filepath).mtimeMs
    } catch {
      return 0
    }
  }

  async findLocaleDirs() {
    this._files = Object.create(null)
    this._localeModules = Object.create(null)
    this._localeDirs = []

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
        debug(`📂 Locale directories:`, this._localeDirs)
      } catch (e) {
        console.error(e)
      }
    }
    if (this._localeDirs.length === 0) {
      logger.warn(`No locales paths.\n`, {
        timestamp: true,
      })
      return false
    }

    return true
  }

  async guessDirStructure(): Promise<DirStructure> {
    const POSITIVE_RATE = 0.6

    const dir = this._localeDirs[0]

    const dirnames = await fg('*', {
      onlyDirectories: true,
      cwd: dir,
      deep: 1,
    })

    const total = dirnames.length
    if (total === 0) return 'file'

    const positives = dirnames.map((d) => tags.check(d))

    const positive = positives.filter((d) => d).length

    // if there are some dirs are named as locale code, guess it's dir mode
    return positive / total >= POSITIVE_RATE ? 'dir' : 'file'
  }

  async resolvePathMatcherByDirStructure() {
    this._dirStructure = await this.guessDirStructure()
    debug(`Directory structure: ${this._dirStructure}`)
    return this.resolvePathMatcher(this._dirStructure)
  }

  resolvePathMatcher(dirStructure?: DirStructure): string {
    if (dirStructure === 'file') {
      return '{locale}.{ext}'
    } else if (this._namespace) {
      return '{locale}/**/{namespace}.{ext}'
    } else {
      return '{locale}/**/*.{ext}'
    }
  }
}
