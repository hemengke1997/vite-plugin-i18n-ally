import type { PluginOption, ViteDevServer } from 'vite'
import type { I18nAllyOptions } from './types'
import path from 'node:path'
import { isEmpty } from 'es-toolkit/compat'
import colors from 'picocolors'
import { LocaleDetector } from './locale-detector'
import { debug } from './utils/debugger'
import { fullReload } from './utils/hmr'
import { initI18nAlly } from './utils/init-i18n-ally'
import { logger } from './utils/logger'
import { VirtualModule } from './utils/virtual'

export { type I18nAllyOptions }

export function i18nAlly(opts?: I18nAllyOptions): any {
  const { options, vscodeSetting } = initI18nAlly(opts)

  debug('User input i18n-ally options on init:', options)

  const localeDetector = new LocaleDetector({
    root: options.root,
    localesPaths: options.localesPaths,
    pathMatcher: options.pathMatcher,
    parserPlugins: options.parserPlugins,
    namespace: options.namespace,
  })

  let server: ViteDevServer | undefined

  return {
    name: 'vite:plugin-i18n-ally',
    enforce: 'pre',
    async config() {
      await localeDetector.init()

      return {
        optimizeDeps: {
          exclude: [VirtualModule.id('*')],
        },
        ssr: {
          // remix virtual modules resolve error
          noExternal: ['vite-plugin-i18n-ally'],
        },
      }
    },
    async resolveId(id, importer) {
      const { virtualModules, resolvedIds } = localeDetector.localeModules

      if (id in virtualModules) {
        return VirtualModule.resolve(id) // E.g. \0/@i18n-ally/virtual:i18n-ally-en
      }

      if (importer) {
        const importerNoPrefix = importer.startsWith(VirtualModule.resolvedPrefix)
          ? importer.slice(VirtualModule.resolvedPrefix.length)
          : importer
        const resolved = path.resolve(path.dirname(importerNoPrefix), id)
        if (resolvedIds.has(resolved)) {
          return VirtualModule.resolvedPrefix + resolved
        }
      }

      if (Object.values(VirtualModule.Mods).includes(id)) {
        // E.g. \0/@i18n-ally/virtual:i18n-ally-async-resource
        // E.g. \0/@i18n-ally/virtual:i18n-ally-resource
        // E.g. \0/@i18n-ally/virtual:i18n-ally-config
        return VirtualModule.resolvedPrefix + id
      }

      return null
    },
    async load(id) {
      const { virtualModules, resolvedIds, modules, modulesWithNamespace } = localeDetector.localeModules
      if (id.startsWith(VirtualModule.resolvedPrefix)) {
        const idNoPrefix = id.slice(VirtualModule.resolvedPrefix.length)

        const resolvedId = idNoPrefix in virtualModules ? idNoPrefix : resolvedIds.get(idNoPrefix)

        // e.g. \0/@i18n-ally/virtual:i18n-ally-en
        if (resolvedId) {
          const module = virtualModules[resolvedId]
          return typeof module === 'string' ? module : `export default ${JSON.stringify(module)}`
        }

        function generateAsyncResourceCode(mode: 'empty' | 'import') {
          let code = `export const resources = { `
          const _modules = options.namespace ? modulesWithNamespace : modules

          for (const k of Object.keys(_modules)) {
            switch (mode) {
              case 'empty':
                code += `'${k}': {},`
                break
              case 'import': {
                if (isEmpty(_modules[k])) {
                  code += `'${k}': () => ({ default: {} }),`
                }
                else {
                  // Currently rollup doesn't support inline chunkName
                  // TODO: inline chunk name
                  code += `'${k}': () => import('${VirtualModule.id(k)}'),`
                }
                break
              }
              default:
                break
            }
          }
          code += ' };'

          return {
            code,
            map: { mappings: '' },
          }
        }

        // \0/@i18n-ally/virtual:i18n-ally-async-resource
        if (id.endsWith(VirtualModule.Mods.asyncResource)) {
          return generateAsyncResourceCode('import')
        }

        // \0/@i18n-ally/virtual:i18n-ally-resource
        if (id.endsWith(VirtualModule.Mods.resource)) {
          const code = `export const resources = ${JSON.stringify(modules)}`

          return {
            code,
            map: { mappings: '' },
          }
        }

        // \0/@i18n-ally/virtual:i18n-ally-empty-resource
        if (id.endsWith(VirtualModule.Mods.emptyResource)) {
          return generateAsyncResourceCode('empty')
        }

        // \0/@i18n-ally/virtual:i18n-ally-config
        if (id.endsWith(VirtualModule.Mods.config)) {
          const code = `export const config = ${JSON.stringify({
            namespace: options.namespace,
            separator: localeDetector.separator,
          })}`
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
      localeDetector.onFileChanged(event, { fsPath: id }).then((updated) => {
        if (updated) {
          logger.info(colors.green(`${event}: `) + colors.gray(updated), { timestamp: true })
          fullReload(server, localeDetector)
        }
      })

      const vscodeFile = vscodeSetting?.findUp()
      if (id === vscodeFile) {
        logger.info(colors.green(`${event}: `) + colors.gray(path.relative(options.root, vscodeFile)), {
          timestamp: true,
        })

        if (vscodeSetting?.isChanged()) {
          // reload server
          server?.restart()
        }
        else {
          fullReload(server, localeDetector)
        }
      }
    },
    closeBundle() {
      server?.httpServer?.close()
    },
  } as PluginOption
}
