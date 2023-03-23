import path from 'path'
import { beforeEach, describe, expect, test } from 'vitest'
import { normalizePath } from 'vite'
import parseGlob from 'parse-glob'
import type { DetectI18nResourceOptions } from '../src/plugin'
import { initModules } from '../src/plugin/utils'
import { ParsePathMatcher } from '../src/plugin/utils/pathMatcher'

declare module 'vitest' {
  export interface TestContext {
    entry: string
  }
}

const options: DetectI18nResourceOptions = {
  include: path.join(__dirname, './locales'),
}

function initEntry() {
  const { include } = options
  const entry = normalizePath(`${include}/**/*.{json,json5}`)
  return entry
}

beforeEach(async (context) => {
  const entry = initEntry()
  context.entry = entry
})

describe('utils', () => {
  // test('should entry path be absolute', () => {
  //   const { localeEntry } = options
  //   expect(localeEntry[0]).not.includes(['.', '/'])
  // })

  test('entry should be glob-like', ({ entry }) => {
    const parsedEntry = parseGlob(entry)
    expect(parsedEntry.is.glob).toBe(true)
  })

  test('entry should be absolute path', ({ entry }) => {
    expect(entry[0]).not.includes(['.', '/'])
  })

  test('glob entry should ends with json(5)', ({ entry }) => {
    const parsedEntry = parseGlob(entry)
    expect(parsedEntry.glob.endsWith('{json,json5}'))
  })

  test('should get modules after init', async ({ entry }) => {
    // let { langModules, resolvedIds, virtualLangModules } = await initModules({ entry })
    // console.log(langModules, 'langModules', resolvedIds, 'resolvedIds', virtualLangModules, 'virtualLangModules')
  })

  test('ParsePathMatcher', () => {
    function enabledParserExts() {
      const enabledParsers = ['json', 'json5']
      return enabledParsers.filter(Boolean).join('|')
    }

    const t = ParsePathMatcher('{locale}/{namespaces}', enabledParserExts())
    console.log(t.test('fd/fdsafdsa.js'))
    console.log(t)
  })
})
