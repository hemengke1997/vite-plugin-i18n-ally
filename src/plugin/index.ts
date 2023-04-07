import path from 'path'
import type { PluginOption } from 'vite'
import { RESOLVED_VIRTUAL_PREFIX, RESOURCE_VIRTURL_HELPER, VIRTUAL } from './utils/constant'
import { LocaleDetector } from './utils/LocaleDetector'
import type { EnableParsersType } from './parsers'
import { debug } from './utils/debugger'

export interface I18nDetectorOptions {
  /**
   * @default
   * process.cwd()
   */
  cwd?: string
  /**
   * @example
   * [path.resolve(__dirname, './src/locales')]
   * ['./src/locales']
   */
  localesPaths: string[]
  /**
   * @example
   * `{locale}/{namespaces}.{ext}`
   * `{locale}/{namespace}.json`
   * `{namespaces}/{locale}`
   * `something/{locale}/{namespace}`
   */
  pathMatcher: string
  /**
   * @default
   * ['json', 'json5']
   * @description
   * Currently support `['json', 'json5']` only
   */
  enabledParsers?: EnableParsersType
}

export async function i18nDetector(options: I18nDetectorOptions) {
  debug('i18nDetector options:', options)

  const localeDetector = new LocaleDetector({
    cwd: options.cwd || process.cwd(),
    localesPaths: options.localesPaths,
    pathMatcher: options.pathMatcher,
    enabledParsers: options.enabledParsers,
  })

  await localeDetector.init()

  return {
    name: 'vite:i18n-detector',
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
          for (const k in modules) {
            // Currently rollup don't support inline chunkName
            // TODO: chunk name
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
    async handleHotUpdate({ file, server }) {
      const updated = await localeDetector.onFileChanged({ fsPath: file })

      if (updated) {
        const { resolvedIds } = localeDetector.localeModules
        debug('hmr', resolvedIds)
        for (const [, value] of resolvedIds) {
          const { moduleGraph, ws } = server
          const module = moduleGraph.getModuleById(RESOLVED_VIRTUAL_PREFIX + value)
          if (module) {
            moduleGraph.invalidateModule(module)
            if (ws) {
              ws.send({
                type: 'full-reload',
                path: '*',
              })
            }
          }
        }
      }
    },
  } as PluginOption
}
