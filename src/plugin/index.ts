import path from 'path'
import type { PluginOption } from 'vite'
import { normalizePath } from 'vite'
import { trimEnd } from '@minko-fe/lodash-pro'
import { clearObjectValue, debug, initModules, invalidateVirtualModule, isJson } from './utils'
import { RESOLVED_VIRTUAL_PREFIX, RESOURCE_VIRTURL_HELPER, VIRTUAL } from './utils/constant'
import { LocaleDetector } from './utils/LocaleDetector'
import type { EnableParsersType } from './parsers'

export interface DetectI18nResourceOptions {
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
   * {namespaces}/{lang}
   * {lang}/{namespace}
   * {locale}/{namespaces}.{ext}
   * something/{lang}/{namespace}
   */
  pathMatcher: string
  /**
   * @description
   * Currently support 'json(5)' only
   */
  enabledParsers: EnableParsersType
}

export async function i18nDetector(options: DetectI18nResourceOptions) {
  debug('plugin options:', options)

  const localeDetector = new LocaleDetector({
    cwd: options.cwd || process.cwd(),
    localesPaths: options.localesPaths,
    pathMatcher: options.pathMatcher,
    enabledParsers: options.enabledParsers,
  })

  let { modules, virtualModules, resolvedIds } = await localeDetector.init()

  return {
    name: 'vite:detect-i18n-resource',
    enforce: 'pre',
    config: () => ({
      optimizeDeps: {
        exclude: [`${VIRTUAL}-*`],
      },
    }),
    async resolveId(id: string, importer: string) {
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
      if (id.startsWith(RESOLVED_VIRTUAL_PREFIX)) {
        const idNoPrefix = id.slice(RESOLVED_VIRTUAL_PREFIX.length)
        const resolvedId = idNoPrefix in virtualModules ? idNoPrefix : resolvedIds.get(idNoPrefix)

        if (resolvedId) {
          const module = virtualModules[resolvedId]
          return typeof module === 'string' ? module : `export default ${JSON.stringify(module)}`
        }

        if (id.endsWith(RESOURCE_VIRTURL_HELPER)) {
          const langs = clearObjectValue(modules)
          let code = `export default { `
          for (const k in langs) {
            // Currently rollup don't support inline chunkName
            // TODO: chunk name
            code += `${k}: () => import('${VIRTUAL}-${k}'),`
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
      // if (file.includes(parsedEntry.base) && isJson(file)) {
      //   const modules = await initModules({ entry })
      //   virtualModules = modules.virtualModules
      //   modules = modules.modules
      //   resolvedIds = modules.resolvedIds
      //   debug('hmr:', file, 'hmr re-inited modules:', modules)
      //   for (const [, value] of resolvedIds) {
      //     invalidateVirtualModule(server, value)
      //   }
      // }
    },
  } as PluginOption
}
