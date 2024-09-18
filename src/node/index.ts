import path from 'node:path'
import { type PluginOption, type ViteDevServer } from 'vite'
import { LocaleDetector } from './locale-detector'
import { type I18nAllyOptions } from './types'
import { ASYNC_RESOURCE, CONFIG, RESOLVED_VIRTUAL_PREFIX, RESOURCE, VIRTUAL } from './utils/constant'
import { debug } from './utils/debugger'
import { fullReload } from './utils/hmr'
import { initI18nAlly } from './utils/init-i18n-ally'

export async function i18nAlly(opts?: I18nAllyOptions): Promise<any> {
  const { options, vscodeSetting } = initI18nAlly(opts)

  debug('User input i18n-ally options on init:', options)

  const localeDetector = new LocaleDetector({
    root: options.root,
    localesPaths: options.localesPaths,
    pathMatcher: options.pathMatcher,
    parserPlugins: options.parserPlugins,
    namespace: options.namespace,
  })

  await localeDetector.init()

  let server: ViteDevServer

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
        return RESOLVED_VIRTUAL_PREFIX + id // E.g. \0/@i18n-ally/virtual:i18n-ally-en
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

      if ([ASYNC_RESOURCE, RESOURCE, CONFIG].includes(id)) {
        // E.g. \0/@i18n-ally/virtual:i18n-ally-async-resource
        // E.g. \0/@i18n-ally/virtual:i18n-ally-resource
        // E.g. \0/@i18n-ally/virtual:i18n-ally-config
        return RESOLVED_VIRTUAL_PREFIX + id
      }

      return null
    },
    async load(id) {
      const { virtualModules, resolvedIds, modules, modulesWithNamespace } = localeDetector.localeModules
      if (id.startsWith(RESOLVED_VIRTUAL_PREFIX)) {
        const idNoPrefix = id.slice(RESOLVED_VIRTUAL_PREFIX.length)

        const resolvedId = idNoPrefix in virtualModules ? idNoPrefix : resolvedIds.get(idNoPrefix)

        // e.g. \0/@i18n-ally/virtual:i18n-ally-en
        if (resolvedId) {
          const module = virtualModules[resolvedId]
          return typeof module === 'string' ? module : `export default ${JSON.stringify(module)}`
        }

        // \0/@i18n-ally/virtual:i18n-ally-async-resource
        if (id.endsWith(ASYNC_RESOURCE)) {
          let code = `export const resources = { `
          for (const k of Object.keys({
            ...modules,
            ...modulesWithNamespace,
          })) {
            // Currently rollup doesn't support inline chunkName
            // TODO: inline chunk name
            code += `'${k}': () => import('${VIRTUAL}-${k}'),`
          }
          code += ' };'

          debug('async resources:', code)

          return {
            code,
            map: { mappings: '' },
          }
        }

        // \0/@i18n-ally/virtual:i18n-ally-resource
        if (id.endsWith(RESOURCE)) {
          const code = `export const resources = ${JSON.stringify(modules)}`

          debug('resources:', code)

          return {
            code,
            map: { mappings: '' },
          }
        }

        // \0/@i18n-ally/virtual:i18n-ally-config
        if (id.endsWith(CONFIG)) {
          const code = `export const config = ${JSON.stringify({
            namespace: options.namespace,
          })}`

          debug('config:', code)

          return {
            code,
            map: { mappings: '' },
          }
        }
      }

      return null
    },
    configureServer(_server) {
      server = _server
    },
    watchChange(id, { event }) {
      const reInit = async () => {
        await localeDetector.init()
        debug('Reinit', id)
        fullReload(server, localeDetector)
      }

      if (event === 'create' || event === 'delete') {
        if (localeDetector.isLocaleFile(id)) {
          reInit()
          return
        }
      }

      if (id === vscodeSetting?.findUp()) {
        reInit()
        return
      }
    },
    closeBundle() {
      server?.httpServer?.close()
    },
    async handleHotUpdate({ file, server }) {
      const updated = await localeDetector.onFileChanged({ fsPath: file })

      if (updated) {
        debug('Hmr', file)
        fullReload(server, localeDetector)
      }
    },
  } as PluginOption
}
