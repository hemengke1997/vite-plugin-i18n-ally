import path from 'path'
import type { PluginOption, ViteDevServer } from 'vite'
import { normalizePath } from 'vite'
import JSONC from 'jsonc-simple-parser'
import parseGlob from 'parse-glob'
import glob from 'tiny-glob'
import stripDirs from 'strip-dirs'
import depth from 'depth'
import fs from 'fs-extra'
import { cloneDeep } from '@minko-fe/lodash-pro'
import createDebug from 'debug'
import { name as PKGNAME } from '../package.json'

const debug = createDebug(PKGNAME)

export interface DetectI18nResourceOptions {
  localeEntry: string
}

type ResourceType<T = any> = Record<string, T>

// Do not modify this variable directly
let globalData = {
  localeDirBasename: '',
  localeEntry: '',
}

function setGlobalData(d: typeof globalData) {
  globalData = d
}

function getGlobalData() {
  return globalData
}

function getLangName(filePath: string) {
  const fileBase = path.basename(path.dirname(filePath))
  const { localeDirBasename, localeEntry } = getGlobalData()
  if (fileBase === localeDirBasename) {
    // FileName is lang
    return [path.parse(filePath).name]
  }
  // Dir is lang
  const len = depth(localeEntry)
  const parsedFile = path.parse(stripDirs(filePath, len))
  return [...path.parse(stripDirs(filePath, len)).dir.split(path.sep), parsedFile.name]
}

function fillObject(obj: ResourceType, keyArray: string[], data: Record<string, any>) {
  keyArray.reduce((current, key, i) => {
    if (!current[key]) {
      current[key] = {}
    }
    if (i === keyArray.length - 1) {
      current[key] = {
        ...current[key],
        ...data,
      }
    }
    return current[key]
  }, obj)

  return obj
}

function getResource(resources: ResourceType, filePath: string) {
  try {
    const lang = getLangName(filePath)

    const jsonData = JSONC.parse(fs.readFileSync(filePath, 'utf-8'))

    fillObject(resources, lang, jsonData)

    return resources
  } catch (error: any) {
    throw new Error(`[${PKGNAME}]: ${filePath} ${error.message}`)
  }
}

const VIRTUAL = 'virtual:i18n'

const RESOLVED_VIRTUAL_PREFIX = '\0/@i18n/'

const RESOURCE_VIRTURL_HELPER = `${VIRTUAL}-helper`

function invalidateVirtualModule(server: ViteDevServer, id: string): void {
  const { moduleGraph, ws } = server
  const module = moduleGraph.getModuleById(RESOLVED_VIRTUAL_PREFIX + id)
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

function clearObjectValue(obj: Record<string, any>) {
  const clone = cloneDeep(obj)
  for (const k in clone) {
    clone[k] = {}
  }
  return clone
}

async function initModules(opts: { entry: string }) {
  const { entry } = opts
  const files = await glob(entry)

  const langModules = files.reduce(getResource, {})

  const resolvedIds = new Map<string, string>()

  const virtualLangModules = cloneDeep(langModules)

  Object.keys(virtualLangModules).forEach((k) => {
    const id = `${VIRTUAL}-${k}`
    virtualLangModules[id] = virtualLangModules[k]
    resolvedIds.set(path.resolve(id), id)
    delete virtualLangModules[k]
  })

  return {
    langModules,
    virtualLangModules,
    resolvedIds,
    files,
  }
}

function isJson(p: string) {
  return /\.json5?$/.test(path.extname(p))
}

export async function i18nDetector(options: DetectI18nResourceOptions) {
  const { localeEntry } = options

  debug('plugin options:', options)

  if (path.parse(localeEntry).ext) {
    throw new Error(`[${PKGNAME}]: localeEntry should be a dir, but got a file.`)
  }

  const entry = normalizePath(`${localeEntry}/**/*.{json,json5}`)

  const parsedEntry = parseGlob(entry)

  const { base } = parsedEntry

  setGlobalData({
    localeDirBasename: path.basename(base),
    localeEntry,
  })

  debug('globalData:', getGlobalData())

  let { langModules, resolvedIds, virtualLangModules } = await initModules({ entry })

  debug('initModules returnValue:', {
    langModules,
    resolvedIds,
    virtualLangModules,
  })

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
      if (file.includes(parsedEntry.base) && isJson(file)) {
        const modules = await initModules({ entry })
        virtualLangModules = modules.virtualLangModules
        langModules = modules.langModules
        resolvedIds = modules.resolvedIds
        debug('hmr:', file, 'hmr re-inited modules:', modules)
        for (const [, value] of resolvedIds) {
          invalidateVirtualModule(server, value)
        }
      }
    },
  } as PluginOption
}
