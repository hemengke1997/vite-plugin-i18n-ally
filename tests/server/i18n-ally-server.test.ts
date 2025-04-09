import { beforeEach, describe, expect, test, vi } from 'vitest'
import { I18nAllyServer, type I18nAllyServerOptions } from '@/server/i18n-ally-server'

describe('I18nAllyServer', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  test('should initialize with provided options', () => {
    const options: I18nAllyServerOptions = {
      fallbackLng: 'en',
      supportedLngs: ['en', 'fr', 'zh-CN'],
      lowerCaseLng: true,
      detection: [{ detect: 'cookie', lookup: 'language' }, { detect: 'header' }],
    }

    const i18nAllyServer = new I18nAllyServer(options)

    expect(i18nAllyServer).toBeDefined()
    expect(i18nAllyServer['options'].fallbackLng).toBe('en')
    expect(i18nAllyServer['options'].supportedLngs).toEqual(['en', 'fr', 'zh-cn'])
  })

  test('should detect language using cookie detector', () => {
    const mockRequest = new Request('http://example.com', {
      headers: {
        cookie: 'language=fr',
      },
    })

    const options: I18nAllyServerOptions = {
      fallbackLng: 'en',
      supportedLngs: ['en', 'fr', 'zh-CN'],
      detection: [{ detect: 'cookie', lookup: 'language' }],
    }

    const i18nAllyServer = new I18nAllyServer(options)

    const detectedLang = i18nAllyServer.detect(mockRequest)

    expect(detectedLang).toBe('fr')
  })

  test('should detect language using header detector', () => {
    const mockRequest = new Request('http://example.com', {
      headers: {
        'accept-language': 'zh-CN,fr;q=0.9',
      },
    })

    const options: I18nAllyServerOptions = {
      fallbackLng: 'en',
      supportedLngs: ['en', 'fr', 'zh-CN'],
      detection: [{ detect: 'header' }],
    }

    const i18nAllyServer = new I18nAllyServer(options)

    const detectedLang = i18nAllyServer.detect(mockRequest)

    expect(detectedLang).toBe('zh-CN')
  })

  test('should detect language using path detector', () => {
    const mockRequest = new Request('http://example.com/fr/about')

    const options: I18nAllyServerOptions = {
      fallbackLng: 'en',
      supportedLngs: ['en', 'fr', 'zh-CN'],
      detection: [{ detect: 'path', lookup: 0 }],
    }

    const i18nAllyServer = new I18nAllyServer(options)

    const detectedLang = i18nAllyServer.detect(mockRequest)

    expect(detectedLang).toBe('fr')
  })

  test('should detect language using query string detector', () => {
    const mockRequest = new Request('http://example.com/?lang=zh-CN')

    const options: I18nAllyServerOptions = {
      fallbackLng: 'en',
      supportedLngs: ['en', 'fr', 'zh-CN'],
      detection: [{ detect: 'querystring', lookup: 'lang' }],
    }

    const i18nAllyServer = new I18nAllyServer(options)

    const detectedLang = i18nAllyServer.detect(mockRequest)

    expect(detectedLang).toBe('zh-CN')
  })

  test('should return fallback language if no detection matches', () => {
    const mockRequest = new Request('http://example.com/')

    const options: I18nAllyServerOptions = {
      fallbackLng: 'en',
      supportedLngs: ['en', 'fr', 'zh-CN'],
      detection: [{ detect: 'cookie', lookup: 'language' }],
    }

    const i18nAllyServer = new I18nAllyServer(options)

    const detectedLang = i18nAllyServer.detect(mockRequest)

    expect(detectedLang).toBe(options.fallbackLng)
  })

  test('should detect by order', () => {
    const mockRequest = new Request('http://example.com/zh-cn/about?lang=en', {
      headers: {
        'accept-language': 'fr',
      },
    })

    const options: I18nAllyServerOptions = {
      fallbackLng: 'en',
      supportedLngs: ['en', 'fr', 'zh-CN'],
      detection: [
        { detect: 'path' },
        { detect: 'header' },
        {
          detect: 'querystring',
          lookup: 'lang',
        },
      ],
    }

    const i18nAllyServer = new I18nAllyServer(options)

    const detectedLang = i18nAllyServer.detect(mockRequest)

    expect(detectedLang).toBe('fr')
  })
})
