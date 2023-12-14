import path from 'node:path'
import { beforeAll, describe, expect, test } from 'vitest'
import { LocaleDetector } from '../src/plugin/locale-detector/LocaleDetector'
import { initOptions } from '../src/plugin/utils/init-options'

describe('LocaleDetector - Dir mode', () => {
  let localeDetector: LocaleDetector

  beforeAll(async () => {
    const options = initOptions()
    localeDetector = new LocaleDetector({
      root: path.resolve(__dirname, './fixtures/'),
      localesPaths: options.localesPaths,
      pathMatcher: options.pathMatcher,
      parserPlugins: options.parserPlugins,
      namespace: options.namespace,
    })

    await localeDetector.init()
  })

  test('should localeDetector find locales', () => {
    expect(localeDetector.files.length).toBeGreaterThan(0)
  })

  test('should no loadFileWaitingList', () => {
    expect(localeDetector.loadFileWaitingListLength).toBe(0)
  })

  test('should localeModules has every locale', () => {
    const { modules } = localeDetector.localeModules
    expect(Object.keys(modules).sort()).toMatchInlineSnapshot(`
      [
        "de",
        "en",
        "zh",
        "zh-tw",
      ]
    `)
  })

  test('should virtualModules has every locale', () => {
    const { virtualModules } = localeDetector.localeModules
    expect(Object.keys(virtualModules).sort()).toMatchInlineSnapshot(`
    [
      "virtual:i18n-de",
      "virtual:i18n-en",
      "virtual:i18n-zh",
      "virtual:i18n-zh-tw",
    ]
  `)
  })

  test('should resolvedIds has every locale', () => {
    const { resolvedIds } = localeDetector.localeModules
    const resolvedIdsValues = Array.from(resolvedIds.values()).sort()
    expect(resolvedIdsValues).toMatchInlineSnapshot(`
      [
        "virtual:i18n-de",
        "virtual:i18n-en",
        "virtual:i18n-zh",
        "virtual:i18n-zh-tw",
      ]
    `)
  })

  test('locale modules', () => {
    const { modules } = localeDetector.localeModules
    expect(modules).toMatchSnapshot()
  })

  test('virtualModules', () => {
    const { virtualModules } = localeDetector.localeModules
    expect(virtualModules).toMatchSnapshot()
  })
})
