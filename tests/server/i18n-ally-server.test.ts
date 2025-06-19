import type { I18nAllyServerOptions } from '@/server'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { I18nAllyServer } from '@/server'

describe('i18nAllyServer', () => {
  beforeAll(() => {
    vi.mock('virtual:i18n-ally-async-resource', () => ({
      resources: {
        'en': {
          translation: {
            hello: 'Hello',
          },
        },
        'fr': {
          translation: {
            hello: 'Bonjour',
          },
        },
        'zh-CN': {
          translation: {
            hello: '你好',
          },
        },
      },
    }))

    vi.mock('virtual:i18n-ally-empty-resource', () => ({
      resources: {
        'en': {},
        'fr': {},
        'zh-CN': {},
      },
    }))

    vi.mock('virtual:i18n-ally-config', () => ({
      config: {
        namespace: false,
        separator: '__',
      },
    }))
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with provided options', () => {
    const options: I18nAllyServerOptions = {
      fallbackLng: 'EN',
      lowerCaseLng: true,
      detection: [{ detect: 'cookie', lookup: 'language' }, { detect: 'header' }],
    }

    const i18nAllyServer = new I18nAllyServer(options)

    expect(i18nAllyServer).toBeDefined()
    expect(i18nAllyServer.fallbackLng).toBe('en')
    expect(i18nAllyServer.supportedLngs).toEqual(['en', 'fr', 'zh-cn'])

    // i18nAllyServer 的options是只读的，不能直接修改
    expect(i18nAllyServer.options).toEqual(options)
  })

  it('should detect language using cookie detector', () => {
    const mockRequest = new Request('http://example.com', {
      headers: {
        cookie: 'language=fr',
      },
    })

    const options: I18nAllyServerOptions = {
      fallbackLng: 'en',
      detection: [{ detect: 'cookie', lookup: 'language' }],
    }

    const i18nAllyServer = new I18nAllyServer(options)

    const detectedLang = i18nAllyServer.detect(mockRequest)

    expect(detectedLang).toBe('fr')
  })

  it('should detect language using header detector', () => {
    const mockRequest = new Request('http://example.com', {
      headers: {
        'accept-language': 'zh-CN,fr;q=0.9',
      },
    })

    const options: I18nAllyServerOptions = {
      fallbackLng: 'en',
      detection: [{ detect: 'header' }],
    }

    const i18nAllyServer = new I18nAllyServer(options)

    const detectedLang = i18nAllyServer.detect(mockRequest)

    expect(detectedLang).toBe('zh-CN')
  })

  it('should detect language using path detector', () => {
    const mockRequest = new Request('http://example.com/fr/about')

    const options: I18nAllyServerOptions = {
      fallbackLng: 'en',
      detection: [{ detect: 'path', lookup: 0 }],
    }

    const i18nAllyServer = new I18nAllyServer(options)

    const detectedLang = i18nAllyServer.detect(mockRequest)

    expect(detectedLang).toBe('fr')
  })

  it('should detect language using query string detector', () => {
    const mockRequest = new Request('http://example.com/?lang=zh-CN')

    const options: I18nAllyServerOptions = {
      fallbackLng: 'en',
      detection: [{ detect: 'querystring', lookup: 'lang' }],
    }

    const i18nAllyServer = new I18nAllyServer(options)

    const detectedLang = i18nAllyServer.detect(mockRequest)

    expect(detectedLang).toBe('zh-CN')
  })

  it('should return fallback language if no detection matches', () => {
    const mockRequest = new Request('http://example.com/')

    const options: I18nAllyServerOptions = {
      fallbackLng: 'en',
      detection: [{ detect: 'cookie', lookup: 'language' }],
    }

    const i18nAllyServer = new I18nAllyServer(options)

    const detectedLang = i18nAllyServer.detect(mockRequest)

    expect(detectedLang).toBe(options.fallbackLng)
  })

  it('should detect by order', () => {
    const mockRequest = new Request('http://example.com/zh-cn/about?lang=en', {
      headers: {
        'accept-language': 'fr',
      },
    })

    const options: I18nAllyServerOptions = {
      fallbackLng: 'en',
      detection: [
        { detect: 'path' },
        { detect: 'header' },
        {
          detect: 'querystring',
          lookup: 'lang',
        },
      ],
      lowerCaseLng: false,
    }

    const i18nAllyServer = new I18nAllyServer(options)

    const detectedLang = i18nAllyServer.detect(mockRequest)

    expect(detectedLang).toBe('fr')
  })

  it('should override lngs', () => {
    const options: I18nAllyServerOptions = {
      fallbackLng: 'en',
      lngs: ['en', 'zh-CN', 'unknown'],
      detection: [{ detect: 'querystring', lookup: 'locale' }],
    }

    const i18nAllyServer = new I18nAllyServer(options)

    // 如果lngs中有不支持的语言，会被过滤掉
    expect(i18nAllyServer.lngs).toEqual(['en', 'zh-CN'])
    expect(i18nAllyServer.detect(new Request('http://example.com?locale=fr'))).toBe('en')
  })
})
