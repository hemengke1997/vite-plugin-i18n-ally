import path from 'path'
import type { PluginOption } from 'vite'
import { createFilter, normalizePath } from 'vite'
import parseGlob from 'parse-glob'
import { trimEnd } from '@minko-fe/lodash-pro'
import { clearObjectValue, debug, initModules, invalidateVirtualModule, isJson } from './utils'
import { PKGNAME, RESOLVED_VIRTUAL_PREFIX, RESOURCE_VIRTURL_HELPER, VIRTUAL } from './utils/constant'
import { LocaleDetector } from './utils/LocaleDetector'
import { isArray, isString } from './utils/is'
import { ParsePathMatcher } from './utils/PathMatcher'

export interface DetectI18nResourceOptions {
  include: string
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
  enabledParsers: Array<'json' | 'json5'>
}

const SUPPORTED_PARSER = ['json', 'json5']

function enabledParserExts(_enabledParsers?: string[]) {
  const enabledParsers = _enabledParsers || SUPPORTED_PARSER
  return enabledParsers.filter(Boolean).join('|')
}

export async function i18nDetector(options: DetectI18nResourceOptions) {
  debug('plugin options:', options)

  const pathMatcher = `${options.pathMatcher}.{ext}`

  const matcher = ParsePathMatcher(pathMatcher, enabledParserExts(options.enabledParsers))

  function joinJsonSuffix(p: string) {
    return `${p}/**/*.{json,json5}`
  }

  // normalize for `options.include`
  let include = options.include
  include = normalizePath(joinJsonSuffix(include))

  let localesPaths = options.localesPaths
  localesPaths = localesPaths.map((item) => trimEnd(normalizePath(joinJsonSuffix(item)), '/\\').replace(/\\/g, '/'))

  const localeDetector = new LocaleDetector({ cwd: options.cwd || process.cwd(), localesPaths, pathMatcher: matcher })

  console.log(localesPaths, 'localesPaths')

  // if (path.parse(localeEntry).ext) {
  //   throw new Error(`[${PKGNAME}]: 'localeEntry' should be a dir path like './src/locales', but got a file`)
  // }

  // if (localeEntry.startsWith('.')) {
  //   localeEntry = path.join(process.cwd(), localeEntry)
  // }

  // const entry = normalizePath(`${localeEntry}/**/*.{json,json5}`)

  // const parsedEntry = parseGlob(entry)

  // const { base } = parsedEntry

  // setGlobalData({
  // localeDirBasename: path.basename(base),
  // localeEntry,
  // })

  // debug('globalData:', getGlobalData())

  let { langModules, resolvedIds, virtualLangModules } = await initModules({ include })

  // debug('initModules returnValue:', {
  //   langModules,
  //   resolvedIds,
  //   virtualLangModules,
  // })

  return {
    name: 'vite:detect-i18n-resource',
    enforce: 'pre',
    config: () => ({
      optimizeDeps: {
        exclude: [`${VIRTUAL}-*`],
      },
    }),
    async resolveId(id: string, importer: string) {
      if (id in virtualLangModules) {
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
        const resolvedId = idNoPrefix in virtualLangModules ? idNoPrefix : resolvedIds.get(idNoPrefix)

        if (resolvedId) {
          const module = virtualLangModules[resolvedId]
          return typeof module === 'string' ? module : `export default ${JSON.stringify(module)}`
        }

        if (id.endsWith(RESOURCE_VIRTURL_HELPER)) {
          const langs = clearObjectValue(langModules)
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
      //   virtualLangModules = modules.virtualLangModules
      //   langModules = modules.langModules
      //   resolvedIds = modules.resolvedIds
      //   debug('hmr:', file, 'hmr re-inited modules:', modules)
      //   for (const [, value] of resolvedIds) {
      //     invalidateVirtualModule(server, value)
      //   }
      // }
    },
  } as PluginOption
}
