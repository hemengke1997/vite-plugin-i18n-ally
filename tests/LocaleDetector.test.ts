import path from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { LocaleDetector } from '../src/node/locale-detector'
import { initI18nAlly } from '../src/node/utils/init-i18n-ally'

describe('LocaleDetector - Namespace', () => {
  let localeDetector: LocaleDetector

  beforeAll(async () => {
    const { options } = initI18nAlly({
      root: path.resolve(__dirname, './fixtures/'),
      localesPaths: [path.resolve(__dirname, './fixtures/locales/')],
      namespace: true,
      useVscodeI18nAllyConfig: false,
    })

    localeDetector = new LocaleDetector(options)

    await localeDetector.init()
  })

  it('should localeDetector find locales', () => {
    expect(localeDetector.files.length).toBeGreaterThan(0)
  })

  it('should localeModules has every locale', () => {
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

  it('should virtualModules has every locale', () => {
    const { virtualModules } = localeDetector.localeModules
    expect(Object.keys(virtualModules).sort()).toMatchInlineSnapshot(`
      [
        "virtual:i18n-ally-de",
        "virtual:i18n-ally-de__more",
        "virtual:i18n-ally-de__test",
        "virtual:i18n-ally-en",
        "virtual:i18n-ally-en__more",
        "virtual:i18n-ally-en__test",
        "virtual:i18n-ally-en__unused",
        "virtual:i18n-ally-zh",
        "virtual:i18n-ally-zh-tw",
        "virtual:i18n-ally-zh-tw__test",
        "virtual:i18n-ally-zh__more",
        "virtual:i18n-ally-zh__test",
      ]
    `)
  })

  it('should resolvedIds has every locale', () => {
    const { resolvedIds } = localeDetector.localeModules
    const resolvedIdsValues = Array.from(resolvedIds.values()).sort()
    expect(resolvedIdsValues).toMatchInlineSnapshot(`
      [
        "virtual:i18n-ally-de",
        "virtual:i18n-ally-de__more",
        "virtual:i18n-ally-de__test",
        "virtual:i18n-ally-en",
        "virtual:i18n-ally-en__more",
        "virtual:i18n-ally-en__test",
        "virtual:i18n-ally-en__unused",
        "virtual:i18n-ally-zh",
        "virtual:i18n-ally-zh-tw",
        "virtual:i18n-ally-zh-tw__test",
        "virtual:i18n-ally-zh__more",
        "virtual:i18n-ally-zh__test",
      ]
    `)
  })

  it('locale modules', () => {
    const { modules } = localeDetector.localeModules
    expect(modules).toMatchSnapshot()
  })

  it('virtualModules', () => {
    const { virtualModules } = localeDetector.localeModules
    expect(virtualModules).toMatchSnapshot()
  })
})

describe('LocaleDetector - Non-Namespace', () => {
  let localeDetector: LocaleDetector

  beforeAll(async () => {
    const { options } = initI18nAlly({
      root: path.resolve(__dirname, './fixtures/'),
      localesPaths: [path.resolve(__dirname, './fixtures/locales-non-namespace/')],
      namespace: false,
      useVscodeI18nAllyConfig: false,
    })

    localeDetector = new LocaleDetector(options)

    await localeDetector.init()
  })

  it('should localeDetector find locales', () => {
    expect(localeDetector.files.length).toBeGreaterThan(0)
  })

  it('should localeModules has every locale', () => {
    const { modules } = localeDetector.localeModules
    expect(Object.keys(modules).sort()).toMatchInlineSnapshot(`
      [
        "en",
        "zh",
      ]
    `)
  })

  it('should virtualModules has every locale', () => {
    const { virtualModules } = localeDetector.localeModules
    expect(Object.keys(virtualModules).sort()).toMatchInlineSnapshot(`
      [
        "virtual:i18n-ally-en",
        "virtual:i18n-ally-zh",
      ]
    `)
  })

  it('should resolvedIds has every locale', () => {
    const { resolvedIds } = localeDetector.localeModules
    const resolvedIdsValues = Array.from(resolvedIds.values()).sort()
    expect(resolvedIdsValues).toMatchInlineSnapshot(`
      [
        "virtual:i18n-ally-en",
        "virtual:i18n-ally-zh",
      ]
    `)
  })

  it('locale modules', () => {
    const { modules } = localeDetector.localeModules
    expect(modules).toMatchSnapshot()
  })

  it('virtualModules', () => {
    const { virtualModules } = localeDetector.localeModules
    expect(virtualModules).toMatchSnapshot()
  })
})
