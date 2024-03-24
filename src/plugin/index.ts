import path from 'node:path'
import { type PluginOption } from 'vite'
import { LocaleDetector } from './locale-detector/LocaleDetector'
import { type ParserConstructor } from './parsers/Parser'
import { RESOLVED_VIRTUAL_PREFIX, RESOURCE_VIRTURL_HELPER, VIRTUAL } from './utils/constant'
import { debug } from './utils/debugger'
import { initWatcher } from './utils/file-watcher'
import { hmr } from './utils/hmr'
import { initOptions } from './utils/init-options'

export type ParserPlugin = ParserConstructor | undefined

export interface I18nAllyOptions {
  /**
   * @description locales directory paths
   *
   * localesPaths are relative to root
   * @default
   * ```js
   * ['./src/locales', './locales']
   * ```
   */
  localesPaths?: string[]
  /**
   * @description root path
   * @default process.cwd()
   */
  root?: string
  /**
   * @description rule of matching locale file
   *
   * auto detect dir structure
   * if file, default is `{locale}.{ext}`
   * if dir, default is `{locale}/**\/*.{ext}`
   * if namespace is true, default is `{locale}/**\/{namespaces}.{ext}`
   *
   * @example
   * `{locale}.{ext}`
   * `{locale}/{namespaces}.{ext}`
   * `{locale}/{namespace}.json`
   * `{namespaces}/{locale}`
   * `something/{locale}/{namespace}`
   */
  pathMatcher?: string
  /**
   * @description
   * parser plugins
   *
   * you can add custom parser plugin if there is no built-in parser for your file extension
   * @example
   * ```js
   * [{
   *    ext: 'json',
   *    parser: (text) => JSON.parse(text),
   * }]
   * ```
   */
  parserPlugins?: ParserPlugin[]
  /**
   * @default false
   */
  namespace?: boolean
  /**
   * @description i18n-ally config root path
   * @default process.cwd()
   *
   * if dotVscodePath is truly,
   * i18n-ally config path is
   * path.resolve(process.cwd(), './vscode/settings.json')
   *
   * if false, will not detect i18n-ally config
   *
   * @deprecated
   * use `root` instead
   */
  dotVscodePath?: string | false
  /**
   * @description auto use config of vscode extension `i18n-ally`
   * @default true
   */
  useVscodeI18nAllyConfig?:
    | boolean
    | {
        stopAt: string
      }
}

export async function i18nAlly(opts?: I18nAllyOptions): Promise<any> {
  const options = initOptions(opts)

  debug('User input i18n-ally options on init:', options)

  const localeDetector = new LocaleDetector({
    root: options.root,
    localesPaths: options.localesPaths,
    pathMatcher: options.pathMatcher,
    parserPlugins: options.parserPlugins,
    namespace: options.namespace,
  })

  await localeDetector.init()

  return {
    name: 'vite:plugin-i18n-ally',
    enforce: 'pre',
    config: () => ({
      optimizeDeps: {
        exclude: [`${VIRTUAL}-*`],
      },
    }),
    async resolveId(id: string, importer: string) {
      const { virtualModules, resolvedIds } = localeDetector.localeModules

      if (id in virtualModules) {
        return RESOLVED_VIRTUAL_PREFIX + id
      }

      if (importer) {
        const importerNoPrefix = importer.startsWith(RESOLVED_VIRTUAL_PREFIX)
          ? importer.slice(RESOLVED_VIRTUAL_PREFIX.length)
          : importer
        const resolved = path.resolve(path.dirname(importerNoPrefix), id)
        if (resolvedIds.has(resolved)) {
          return RESOLVED_VIRTUAL_PREFIX + resolved
        }
      }

      if (id === RESOURCE_VIRTURL_HELPER) {
        return RESOLVED_VIRTUAL_PREFIX + RESOURCE_VIRTURL_HELPER
      }

      return null
    },
    async load(id) {
      const { virtualModules, resolvedIds, modules } = localeDetector.localeModules
      if (id.startsWith(RESOLVED_VIRTUAL_PREFIX)) {
        const idNoPrefix = id.slice(RESOLVED_VIRTUAL_PREFIX.length)
        const resolvedId = idNoPrefix in virtualModules ? idNoPrefix : resolvedIds.get(idNoPrefix)

        if (resolvedId) {
          const module = virtualModules[resolvedId]
          return typeof module === 'string' ? module : `export default ${JSON.stringify(module)}`
        }

        if (id.endsWith(RESOURCE_VIRTURL_HELPER)) {
          let code = `export default { `
          for (const k of Object.keys(modules)) {
            // Currently rollup doesn't support inline chunkName
            // TODO: inline chunk name
            code += `'${k}': () => import('${VIRTUAL}-${k}'),`
          }
          code += ' };'

          debug('helper:', code)

          return {
            code,
            map: { mappings: '' },
          }
        }
      }

      return null
    },
    configureServer(server) {
      debug('Watch target:', localeDetector.localeDirs)
      initWatcher(localeDetector.localeDirs, async (_type, p, pnext) => {
        if (!p) return

        debug('watcher', p, '=========>', pnext)
        const _hmr = async () => {
          await localeDetector.init()
          hmr(server, localeDetector)
        }

        if (path.extname(p) && localeDetector.allLocaleFiles.has(p)) {
          // file
          _hmr()
          return
        }
        if (localeDetector.allLocaleDirs.has(p)) {
          _hmr()
          return
        }
      })
    },
    async handleHotUpdate({ file, server }) {
      const updated = await localeDetector.onFileChanged({ fsPath: file })

      if (updated) {
        debug('hmr', file)
        hmr(server, localeDetector)
      }
    },
  } as PluginOption
}
