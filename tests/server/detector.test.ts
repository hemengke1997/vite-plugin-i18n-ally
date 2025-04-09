import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { Cookie } from '@/server/detectors/cookie'
import { Header } from '@/server/detectors/header'
import { Path } from '@/server/detectors/path'
import { QueryString } from '@/server/detectors/query-string'

describe('Cookie (Server)', () => {
  let cookieDetector: Cookie

  beforeEach(() => {
    cookieDetector = new Cookie()
  })

  describe('lookup', () => {
    test('should return the correct value for a given cookie name', () => {
      const mockRequest = new Request('http://example.com', {
        headers: {
          cookie: 'language=en; theme=dark',
        },
      })

      const result = cookieDetector.resolveLanguage({ lookup: 'language', request: mockRequest })

      expect(result).toBe('en')
    })

    test('should return null if the cookie does not exist', () => {
      const mockRequest = new Request('http://example.com', {
        headers: {
          cookie: 'theme=dark',
        },
      })

      const result = cookieDetector.resolveLanguage({ lookup: 'language', request: mockRequest })

      expect(result).toBeFalsy()
    })

    test('should return null if no cookies are present in the request', () => {
      const mockRequest = new Request('http://example.com', {
        headers: {},
      })

      const result = cookieDetector.resolveLanguage({ lookup: 'language', request: mockRequest })

      expect(result).toBeFalsy()
    })
  })
})

describe('Header (Server)', () => {
  let headerDetector: Header

  beforeEach(() => {
    headerDetector = new Header()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('lookup', () => {
    test('should return the matched language from the Accept-Language header', () => {
      const mockRequest = new Request('http://example.com', {
        headers: {
          'accept-language': 'en-US,fr;q=0.9',
        },
      })

      const mockLanguages = ['en-US', 'fr']

      const result = headerDetector.resolveLanguage({ request: mockRequest, languages: mockLanguages })

      expect(result).toBe('en-US')
    })

    test('should return null if no matching language is found', () => {
      const mockRequest = new Request('http://example.com', {
        headers: {
          'accept-language': 'de-DE',
        },
      })

      const mockLanguages = ['en-US', 'fr']

      const result = headerDetector.resolveLanguage({ request: mockRequest, languages: mockLanguages })

      expect(result).toBeFalsy()
    })

    test('should return null if the Accept-Language header is missing', () => {
      const mockRequest = new Request('http://example.com', {
        headers: {},
      })

      const mockLanguages = ['en-US', 'fr']

      const result = headerDetector.resolveLanguage({ request: mockRequest, languages: mockLanguages })

      expect(result).toBeFalsy()
    })
  })
})

describe('Path (Server)', () => {
  let pathDetector: Path

  beforeEach(() => {
    pathDetector = new Path()
  })

  describe('lookup', () => {
    test('should return the language from the specified path index', () => {
      const mockRequest = new Request('http://example.com/en/about')

      const result = pathDetector.resolveLanguage({ lookup: 0, request: mockRequest })

      expect(result).toBe('en')
    })

    test('should return undefined if the path index is out of bounds', () => {
      const mockRequest = new Request('http://example.com/en/about?q=1')

      const result = pathDetector.resolveLanguage({ lookup: 1, request: mockRequest })

      expect(result).toBe('about')
    })

    test('should return undefined if the URL has no matching segments', () => {
      const mockRequest = new Request('http://example.com/')

      const result = pathDetector.resolveLanguage({ lookup: 0, request: mockRequest })

      expect(result).toBeFalsy()
    })
  })
})

describe('QueryString (Server)', () => {
  let queryStringDetector: QueryString

  beforeEach(() => {
    queryStringDetector = new QueryString()
  })

  describe('lookup', () => {
    test('should return the value of the specified query parameter', () => {
      const mockRequest = new Request('http://example.com/?lang=en')

      const result = queryStringDetector.resolveLanguage({ lookup: 'lang', request: mockRequest })

      expect(result).toBe('en')
    })

    test('should return null if the query parameter does not exist', () => {
      const mockRequest = new Request('http://example.com/?other=value')

      const result = queryStringDetector.resolveLanguage({ lookup: 'lang', request: mockRequest })

      expect(result).toBeFalsy()
    })

    test('should return null if the URL has no query parameters', () => {
      const mockRequest = new Request('http://example.com/')

      const result = queryStringDetector.resolveLanguage({ lookup: 'lang', request: mockRequest })

      expect(result).toBeFalsy()
    })

    test('should handle URLs with multiple query parameters', () => {
      const mockRequest = new Request('http://example.com/?lang=en&theme=dark')

      const result = queryStringDetector.resolveLanguage({ lookup: 'theme', request: mockRequest })

      expect(result).toBe('dark')
    })
  })
})
