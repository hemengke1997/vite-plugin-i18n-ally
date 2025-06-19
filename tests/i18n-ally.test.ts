import type { ViteDevServer } from 'vite'
import type { Mock, MockInstance } from 'vitest'
import type { I18nAllyClientOptions } from '@/client'
import path from 'node:path'
import { createServer } from 'vite'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,

  vi,
} from 'vitest'

async function createViteServer() {
  const i18nAlly = await import('@/node').then(m => m.i18nAlly)

  const server = await createServer({
    plugins: [
      i18nAlly({
        localesPaths: [path.resolve(__dirname, './fixtures/locales')],
      }),
    ],
    server: {
      port: 3000,
    },
  })

  await server.listen()

  const resources = await server.ssrLoadModule('virtual:i18n-ally-async-resource')
  const config = await server.ssrLoadModule('virtual:i18n-ally-config')
  vi.doMock('virtual:i18n-ally-async-resource', () => resources)
  vi.doMock('virtual:i18n-ally-empty-resource', () => resources)
  vi.doMock('virtual:i18n-ally-config', () => config)

  return server
}

describe('i18nAlly', () => {
  let onResourceLoadedMock: Mock
  let onInitMock: Mock
  let onInitedMock: Mock
  let consoleWarnMock: MockInstance
  let viteServer: ViteDevServer

  beforeAll(async () => {
    viteServer = await createViteServer()
  })

  beforeEach(async () => {
    onResourceLoadedMock = vi.fn()
    onInitMock = vi.fn()
    onInitedMock = vi.fn()
    consoleWarnMock = vi.spyOn(console, 'warn')
  })

  afterEach(async () => {
    vi.restoreAllMocks()
  })

  afterAll(async () => {
    await viteServer.close()
  })

  it('should initialize with provided options', async () => {
    const options: I18nAllyClientOptions = {
      fallbackLng: 'en',
      lng: 'en',
      lowerCaseLng: true,
      detection: [],
      onResourceLoaded: onResourceLoadedMock,
      onBeforeInit: onInitMock,
      onInited: onInitedMock,
    }
    const I18nAlly = await import('@/client/i18n-ally-client').then(m => m.I18nAllyClient)

    const i18nAlly = new I18nAlly(options)

    expect(i18nAlly).toBeDefined()
    expect(i18nAlly.supportedLngs).toContain('en')
    expect(i18nAlly.supportedNs).toBeDefined()

    // i18nAllyClient 的options是只读的，不能直接修改
    expect(i18nAlly['options']).toEqual(options)
  })

  it('should load resources for a specific language and namespace', async () => {
    const options: I18nAllyClientOptions = {
      fallbackLng: 'en',
      lng: 'en',
      lowerCaseLng: true,
      detection: [],
      onResourceLoaded: onResourceLoadedMock,
    }
    const I18nAlly = await import('@/client/i18n-ally-client').then(m => m.I18nAllyClient)

    const i18nAlly = new I18nAlly(options)

    await i18nAlly.asyncLoadResource('zh', { ns: 'test' })

    expect(onResourceLoadedMock).toHaveBeenCalledWith({ key: '中文' }, { lng: 'zh', ns: 'test' })
  })

  it('should fallback to default language if resource is missing', async () => {
    const options: I18nAllyClientOptions = {
      fallbackLng: 'en',
      lng: 'fr',
      lowerCaseLng: true,
      detection: [],
      onResourceLoaded: onResourceLoadedMock,
    }

    const I18nAlly = await import('@/client/i18n-ally-client').then(m => m.I18nAllyClient)

    const i18nAlly = new I18nAlly(options)

    expect(consoleWarnMock).toBeCalledTimes(1)

    await i18nAlly.asyncLoadResource('es', { ns: 'test' })

    expect(onResourceLoadedMock).toHaveBeenCalledWith({ key: 'en' }, { lng: 'en', ns: 'test' })

    expect(consoleWarnMock).toBeCalledTimes(2)
  })

  it('should override lngs', async () => {
    const options: I18nAllyClientOptions = {
      fallbackLng: 'en',
      lngs: ['en', 'zh', 'unknown'],
      lowerCaseLng: true,
      detection: [],
      onResourceLoaded: onResourceLoadedMock,
    }

    const I18nAlly = await import('@/client/i18n-ally-client').then(m => m.I18nAllyClient)

    const i18nAlly = new I18nAlly(options)

    // 如果lngs中有不支持的语言，会被过滤掉
    expect(i18nAlly.lngs).toEqual(['en', 'zh'])
    expect(i18nAlly.supportedLngs).toEqual(expect.arrayContaining(['de', 'en', 'zh-tw', 'zh']))

    await i18nAlly.asyncLoadResource('de', { ns: 'test' })

    expect(consoleWarnMock).toHaveBeenCalledWith(
      '[vite-plugin-i18n-ally]',
      'Current language \'de\' not found in locale resources, fallback to \'en\'',
    )
  })
})

// TODO: more test
