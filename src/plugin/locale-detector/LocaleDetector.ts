import cloneDeep from 'clone-deep'
import fg from 'fast-glob'
import tags from 'language-tags'
import path from 'node:path'
import trimEnd from 'string.prototype.trimend'
import uniq from 'uniq'
import { normalizePath } from 'vite'
import { type I18nAllyOptions } from '../interface'
import { DefaultEnabledParsers } from '../parsers'
import { Parser } from '../parsers/Parser'
import { ParsePathMatcher } from '../path-matcher/PathMatcher'
import { PKGNAME, VIRTUAL } from '../utils/constant'
import { debug } from '../utils/debugger'
import { logger } from '../utils/logger'

export type Config = Omit<Required<I18nAllyOptions>, 'useVscodeI18nAllyConfig'>

type PathMatcherType = RegExp

type DirStructure = 'file' | 'dir'

export interface FileInfo {
  filepath: string
  deepDirpath: string
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
  private _dirStructure: DirStructure = 'file'
  private _pathMatcher: { regex: PathMatcherType; matcher: string } | undefined
  private _localesPaths: string[]
  private _rootPath: string
  private _namespace: boolean

  private _localeDirs: string[] = []
  private _files: Record<string, ParsedFile> = {}
  private _localeModules: {
    modules: Record<string, any>
    virtualModules: Record<string, any>
    resolvedIds: Map<string, string>
  } = { modules: {}, virtualModules: {}, resolvedIds: new Map() }

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

      debug(`\nThe real I18nAlly options: `, {
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

    debug('Module locale updated', this._localeModules)
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

  async onFileChanged({ fsPath: filepath }: { fsPath: string }) {
    filepath = path.resolve(filepath)

    const { dirpath, relative } = this.getRelativePath(filepath) || {}

    if (!dirpath || !relative) {
      return
    }

    debug(`File changed  ${relative} ${dirpath}`)

    return this.lazyLoadFile(dirpath, relative)
  }

  private loadFileWaitingList: [string, string][] = []

  get loadFileWaitingListLength() {
    return this.loadFileWaitingList.length
  }

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
    if (!this.loadFileWaitingList.some(([a, b]) => a === d && b === r)) {
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
      throw new Error(`[${PKGNAME}]: No locale files detected. Please check your config.`)
    }
  }

  private async loadDirectory(dirPath: string) {
    const files = await fg('**/*.*', {
      cwd: dirPath,
      onlyFiles: true,
      ignore: ['node_modules/**'],
      deep: undefined,
    })

    for (const relative of files) {
      await this.loadFile(dirPath, relative)
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

      debug(`Loading (${locale}) ${relativePath}`)

      const data = await parser.load(filepath)

      const deepDirpath = path.dirname(filepath)

      this._files[filepath] = {
        filepath,
        deepDirpath,
        dirpath,
        locale,
        value: data,
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

    let namespace = match.groups?.namespace
    if (namespace) {
      namespace = namespace.replaceAll('/', '.')
    }

    const locale = match.groups?.locale

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

  private getMatchedParser(ext: string) {
    if (!ext.startsWith('.') && ext.includes('.')) {
      ext = path.extname(ext)
    }

    // resolve parser
    return this.getParsers().find((parser) => parser.supports(ext))
  }

  private enabledParserExts() {
    const enabledParsers = this.getParsers().map((item) => item.supportedExts)
    return enabledParsers.filter(Boolean).join('|')
  }

  private getParsers() {
    const _parsers = this.config.parserPlugins?.filter(Boolean)

    const parsers: Parser[] = DefaultEnabledParsers
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
      logger.error('\nNo locales paths.')
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
