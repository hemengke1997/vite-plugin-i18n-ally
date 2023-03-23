import path from 'path'
import type { ViteDevServer } from 'vite'
import JSONC from 'jsonc-simple-parser'
import glob from 'tiny-glob'
import stripDirs from 'strip-dirs'
import depth from 'depth'
import fs from 'fs-extra'
import cloneDeep from 'clone-deep'
import createDebug from 'debug'
import type { DetectI18nResourceOptions } from '..'
// import { getGlobalData } from './LocaleDetector'
import { PKGNAME, RESOLVED_VIRTUAL_PREFIX, VIRTUAL } from './constant'
import { isArray } from './is'

export const debug = createDebug(PKGNAME)

type ResourceType<T = any> = Record<string, T>

function getLangName(resourcePath: string) {
  // const fileBase = path.basename(path.dirname(resourcePath))

  // const { localeDirBasename, localeEntry } = getGlobalData()
  // if (fileBase === localeDirBasename) {
  //   // FileName is lang
  //   return [path.parse(resourcePath).name]
  // }
  // // Dir is lang
  // const len = depth(localeEntry)
  // console.log(len)
  // const parsedFile = path.parse(stripDirs(resourcePath, len))
  // return [...path.parse(stripDirs(resourcePath, len)).dir.split(path.sep), parsedFile.name]
  return []
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

function getResource(resources: ResourceType, resourcePath: string) {
  try {
    const lang = getLangName(resourcePath)

    console.log(lang, 'lang')

    const jsonData = JSONC.parse(fs.readFileSync(resourcePath, 'utf-8'))

    fillObject(resources, lang, jsonData)

    return resources
  } catch (error: any) {
    throw new Error(`[${PKGNAME}]: ${error.message}`)
  }
}

export function invalidateVirtualModule(server: ViteDevServer, id: string): void {
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

export function clearObjectValue(obj: Record<string, any>) {
  const clone = cloneDeep(obj)
  for (const k in clone) {
    clone[k] = {}
  }
  return clone
}

export async function initModules(opts: { include: DetectI18nResourceOptions['include'] }) {
  const { include } = opts

  let resourcePaths: string[] = []
  const includePaths = isArray(include) ? include : [include]

  for (const inc of includePaths) {
    resourcePaths = [...resourcePaths, ...(await glob(inc))]
  }

  resourcePaths = resourcePaths.filter((el, pos) => resourcePaths.indexOf(el) === pos)

  const langModules = resourcePaths.reduce(getResource, {})

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
    resourcePaths,
  }
}

export function isJson(p: string) {
  return /\.json5?$/.test(path.extname(p))
}
