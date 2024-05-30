import path from 'node:path'
import { type PluginOption } from 'vite'
import { type I18nAllyOptions } from './interface'
import { LocaleDetector } from './locale-detector/LocaleDetector'
import { RESOLVED_VIRTUAL_PREFIX, RESOURCE_VIRTURL_HELPER, VIRTUAL } from './utils/constant'
import { debug } from './utils/debugger'
import { initWatcher } from './utils/file-watcher'
import { hmr } from './utils/hmr'
import { initOptions } from './utils/init-options'

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
        return RESOLVED_VIRTUAL_PREFIX + id // e.g. \0/@i18n-ally/virtual:i18n-ally-en
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
        return RESOLVED_VIRTUAL_PREFIX + RESOURCE_VIRTURL_HELPER // \0/@i18n-ally/virtual:i18n-ally-helper
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
