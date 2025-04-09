import path from 'node:path'
import { createServer, type ViteDevServer } from 'vite'
import { afterEach, beforeEach, describe, expect, type Mock, type MockInstance, test, vi } from 'vitest'
import { type I18nAllyClientOptions } from '@/client'

async function createViteServer() {
  const i18nAlly = await import('@/node').then((m) => m.i18nAlly)

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
  vi.doMock('virtual:i18n-ally-config', () => config)

  return server
}

describe('I18nAlly', () => {
  let onResourceLoadedMock: Mock
  let onInitMock: Mock
  let onInitedMock: Mock
  let consoleWarnMock: MockInstance
  let viteServer: ViteDevServer

  beforeEach(async () => {
    onResourceLoadedMock = vi.fn()
    onInitMock = vi.fn()
    onInitedMock = vi.fn()
    consoleWarnMock = vi.spyOn(console, 'warn')

    viteServer = await createViteServer()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await viteServer.close()
  })

  test('should initialize with provided options', async () => {
    const options: I18nAllyClientOptions = {
      fallbackLng: 'en',
      language: 'en',
      lowerCaseLng: true,
      detection: [],
      onResourceLoaded: onResourceLoadedMock,
      onInit: onInitMock,
      onInited: onInitedMock,
    }
    const I18nAlly = await import('@/client/i18n-ally-client').then((m) => m.I18nAllyClient)

    const i18nAlly = new I18nAlly(options)

    expect(i18nAlly).toBeDefined()
    expect(i18nAlly.supportedLngs).toContain('en')
    expect(i18nAlly.supportedNamespace).toBeDefined()
  })

  test('should load resources for a specific language and namespace', async () => {
    const options: I18nAllyClientOptions = {
      fallbackLng: 'en',
      language: 'en',
      lowerCaseLng: true,
      detection: [],
      onResourceLoaded: onResourceLoadedMock,
    }
    const I18nAlly = await import('@/client/i18n-ally-client').then((m) => m.I18nAllyClient)

    const i18nAlly = new I18nAlly(options)

    await i18nAlly.asyncLoadResource('zh', { namespaces: 'test' })

    expect(onResourceLoadedMock).toHaveBeenCalledWith({ key: '中文' }, { language: 'zh', namespace: 'test' })
  })

  test('should fallback to default language if resource is missing', async () => {
    const options: I18nAllyClientOptions = {
      fallbackLng: 'en',
      language: 'fr',
      lowerCaseLng: true,
      detection: [],
      onResourceLoaded: onResourceLoadedMock,
    }

    const I18nAlly = await import('@/client/i18n-ally-client').then((m) => m.I18nAllyClient)

    const i18nAlly = new I18nAlly(options)

    expect(consoleWarnMock).toBeCalledTimes(1)

    await i18nAlly.asyncLoadResource('es', { namespaces: 'test' })

    expect(onResourceLoadedMock).toHaveBeenCalledWith({ key: 'en' }, { language: 'en', namespace: 'test' })

    expect(consoleWarnMock).toBeCalledTimes(2)
  })
})

// TODO: more test
