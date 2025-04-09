// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { Cookie } from '@/client/detectors/cookie'
import { HtmlTag } from '@/client/detectors/html-tag'
import { LocalStorage } from '@/client/detectors/local-storage'
import { Navigator } from '@/client/detectors/navigator'
import { Path } from '@/client/detectors/path'
import { QueryString } from '@/client/detectors/query-string'
import { SessionStorage } from '@/client/detectors/session-storage'

describe('HtmlTag', () => {
  let htmlTag: HtmlTag

  beforeEach(() => {
    htmlTag = new HtmlTag()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('lookup', () => {
    test('should return the value of the specified attribute if it exists', () => {
      const mockElement = { getAttribute: vi.fn().mockReturnValue('en') }
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement as unknown as HTMLElement)

      const result = htmlTag.resolveLanguage({ lookup: 'lang' })

      expect(document.querySelector).toHaveBeenCalledWith('html')
      expect(mockElement.getAttribute).toHaveBeenCalledWith('lang')
      expect(result).toBe('en')
    })

    test('should return undefined if the attribute does not exist', () => {
      const mockElement = { getAttribute: vi.fn().mockReturnValue(null) }
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement as unknown as HTMLElement)

      const result = htmlTag.resolveLanguage({ lookup: 'lang' })

      expect(document.querySelector).toHaveBeenCalledWith('html')
      expect(mockElement.getAttribute).toHaveBeenCalledWith('lang')
      expect(result).toBeFalsy()
    })

    test('should return undefined if no html element is found', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null)

      const result = htmlTag.resolveLanguage({ lookup: 'lang' })

      expect(document.querySelector).toHaveBeenCalledWith('html')
      expect(result).toBeFalsy()
    })
  })

  describe('cacheUserLanguage', () => {
    test('should set the specified attribute to the given value', () => {
      const mockElement = { setAttribute: vi.fn() }
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement as unknown as HTMLElement)

      htmlTag.cacheUserLanguage('en', { cache: 'lang' })

      expect(document.querySelector).toHaveBeenCalledWith('html')
      expect(mockElement.setAttribute).toHaveBeenCalledWith('lang', 'en')
    })

    test('should do nothing if no html element is found', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null)

      htmlTag.cacheUserLanguage('en', { cache: 'lang' })

      expect(document.querySelector).toHaveBeenCalledWith('html')
    })
  })
})

describe('LocalStorage', () => {
  let localStorageDetector: LocalStorage
  beforeEach(() => {
    localStorageDetector = new LocalStorage()
    vi.spyOn(window.localStorage.__proto__, 'getItem')
    vi.spyOn(window.localStorage.__proto__, 'setItem')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('lookup', () => {
    test('should retrieve the correct value from localStorage', () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue('en')

      const result = localStorageDetector.resolveLanguage({ lookup: 'language' })

      expect(window.localStorage.getItem).toHaveBeenCalledWith('language')
      expect(result).toBe('en')
    })

    test('should return null if the key does not exist in localStorage', () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue(null)

      const result = localStorageDetector.resolveLanguage({ lookup: 'nonexistent' })

      expect(window.localStorage.getItem).toHaveBeenCalledWith('nonexistent')
      expect(result).toBeNull()
    })

    test('should handle undefined lookup key gracefully', () => {
      const result = localStorageDetector.resolveLanguage({ lookup: undefined as unknown as string })

      expect(window.localStorage.getItem).toHaveBeenCalledWith(undefined)
      expect(result).toBeNull()
    })
  })

  describe('cacheUserLanguage', () => {
    test('should set the correct value in localStorage', () => {
      localStorageDetector.cacheUserLanguage('en', { cache: 'language' })

      expect(window.localStorage.setItem).toHaveBeenCalledWith('language', 'en')
    })

    test('should overwrite an existing value in localStorage', () => {
      localStorageDetector.cacheUserLanguage('fr', { cache: 'language' })

      expect(window.localStorage.setItem).toHaveBeenCalledWith('language', 'fr')
    })

    test('should handle undefined cache key gracefully', () => {
      localStorageDetector.cacheUserLanguage('en', { cache: undefined as unknown as string })

      expect(window.localStorage.setItem).toHaveBeenCalledWith(undefined, 'en')
    })

    test('should handle undefined language value gracefully', () => {
      localStorageDetector.cacheUserLanguage(undefined as unknown as string, { cache: 'language' })

      expect(window.localStorage.setItem).toHaveBeenCalledWith('language', undefined)
    })
  })
})

describe('Navigator', () => {
  let navigatorDetector: Navigator

  beforeEach(() => {
    navigatorDetector = new Navigator()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('lookup', () => {
    test('should return a matching language from navigator.languages', () => {
      // Mock navigator.languages
      const mockLanguages = ['en-US', 'fr-FR']
      vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(mockLanguages)

      const result = navigatorDetector.resolveLanguage({ languages: ['en-us', 'es-ES'] })

      expect(result).toBe('en-US')
    })

    test('should return undefined if no matching language is found', () => {
      // Mock navigator.languages
      const mockLanguages = ['de-DE', 'fr-FR']
      vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(mockLanguages)

      const result = navigatorDetector.resolveLanguage({ languages: ['en-us', 'es-ES'] })

      expect(result).toBeFalsy()
    })

    test('should return undefined if navigator.languages is not defined', () => {
      // Mock navigator.languages as undefined
      vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(undefined as any)

      const result = navigatorDetector.resolveLanguage({ languages: ['en-us', 'es-ES'] })

      expect(result).toBeFalsy()
    })
  })
})

describe('Path', () => {
  let pathDetector: Path

  beforeEach(() => {
    pathDetector = new Path()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('lookup', () => {
    test('should return the language from the specified path index', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        pathname: '/en/about',
      } as Location)

      const result = pathDetector.resolveLanguage({ lookup: 0 })

      expect(result).toBe('en')
    })

    test('should return undefined if the path index is out of bounds', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        pathname: '/en/about',
      } as Location)

      const result = pathDetector.resolveLanguage({ lookup: 2 })

      expect(result).toBeUndefined()
    })

    test('should return undefined if window is undefined', () => {
      const originalWindow = global.window
      // Temporarily remove window
      delete (global as any).window

      const result = pathDetector.resolveLanguage({ lookup: 0 })

      expect(result).toBeUndefined()

      // Restore window
      global.window = originalWindow
    })
  })

  describe('cacheUserLanguage', () => {
    test('should update the URL with the new language', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        href: 'http://example.com/en/about?q=1',
        pathname: '/en/about',
      } as Location)

      const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {}) // Mock replaceState to do nothing

      pathDetector.cacheUserLanguage('fr', { cache: 0, languages: ['en', 'fr'] })

      expect(replaceStateSpy).toHaveBeenCalledWith({}, '', new URL('/fr/about?q=1', 'http://example.com'))
    })

    test('should do nothing if the language is already set', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        href: 'http://example.com/fr/about',
        pathname: '/fr/about',
      } as Location)

      const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {}) // Mock replaceState to do nothing

      pathDetector.cacheUserLanguage('fr', { cache: 0, languages: ['en', 'fr'] })

      expect(replaceStateSpy).not.toHaveBeenCalled()
    })

    test('should handle cases where the path index is invalid', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        href: 'http://example.com/about',
        pathname: '/about',
      } as Location)

      const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {}) // Mock replaceState to do nothing

      pathDetector.cacheUserLanguage('fr', { cache: 0, languages: ['en', 'fr'] })

      expect(replaceStateSpy).toHaveBeenCalledWith({}, '', new URL('/fr/about', 'http://example.com'))
    })
  })
})

describe('QueryString', () => {
  let queryStringDetector: QueryString

  beforeEach(() => {
    queryStringDetector = new QueryString()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('lookup', () => {
    test('should return the value of the specified query parameter', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        search: '?lang=en',
      } as Location)

      const result = queryStringDetector.resolveLanguage({ lookup: 'lang' })

      expect(result).toBe('en')
    })

    test('should return null if the query parameter does not exist', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        search: '?other=123',
      } as Location)

      const result = queryStringDetector.resolveLanguage({ lookup: 'lang' })

      expect(result).toBeNull()
    })
  })

  describe('cacheUserLanguage', () => {
    test('should update the query parameter with the new language', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        href: 'http://example.com/?lang=en',
        search: '?lang=en',
      } as Location)

      const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})

      queryStringDetector.cacheUserLanguage('fr', { cache: 'lang' })

      vi.advanceTimersToNextTimer()
      expect(replaceStateSpy).toHaveBeenCalledWith({}, '', new URL('http://example.com/?lang=fr'))
    })

    test('should add the query parameter if it does not exist', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        href: 'http://example.com/',
        search: '',
      } as Location)

      const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})

      queryStringDetector.cacheUserLanguage('fr', { cache: 'lang' })

      vi.advanceTimersToNextTimer()

      expect(replaceStateSpy).toHaveBeenCalledWith({}, '', new URL('http://example.com/?lang=fr'))
    })
  })
})

describe('SessionStorage', () => {
  let sessionStorageDetector: SessionStorage

  beforeEach(() => {
    sessionStorageDetector = new SessionStorage()
    vi.spyOn(window.sessionStorage.__proto__, 'getItem')
    vi.spyOn(window.sessionStorage.__proto__, 'setItem')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('lookup', () => {
    test('should retrieve the correct value from sessionStorage', () => {
      vi.mocked(window.sessionStorage.getItem).mockReturnValue('en')

      const result = sessionStorageDetector.resolveLanguage({ lookup: 'language' })

      expect(window.sessionStorage.getItem).toHaveBeenCalledWith('language')
      expect(result).toBe('en')
    })

    test('should return null if the key does not exist in sessionStorage', () => {
      vi.mocked(window.sessionStorage.getItem).mockReturnValue(null)

      const result = sessionStorageDetector.resolveLanguage({ lookup: 'nonexistent' })

      expect(window.sessionStorage.getItem).toHaveBeenCalledWith('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('cacheUserLanguage', () => {
    test('should set the correct value in sessionStorage', () => {
      sessionStorageDetector.cacheUserLanguage('en', { cache: 'language' })

      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('language', 'en')
    })

    test('should overwrite an existing value in sessionStorage', () => {
      sessionStorageDetector.cacheUserLanguage('fr', { cache: 'language' })

      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('language', 'fr')
    })
  })
})

describe('Cookie', () => {
  let cookieDetector: Cookie

  beforeEach(() => {
    cookieDetector = new Cookie()
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('lookup', () => {
    test('should return the correct value for a given cookie name', () => {
      document.cookie = 'language=en'

      const result = cookieDetector.resolveLanguage({ lookup: 'language' })

      expect(result).toBe('en')
    })

    test('should return null if the cookie does not exist', () => {
      document.cookie = 'other=value'

      const result = cookieDetector.resolveLanguage({ lookup: 'language' })

      expect(result).toBeNull()
    })

    test('should handle cookies with encoded values', () => {
      document.cookie = 'language=%E4%B8%AD%E6%96%87'

      const result = cookieDetector.resolveLanguage({ lookup: 'language' })

      expect(result).toBe('中文')
    })

    test('should return null if no cookie name is provided', () => {
      const result = cookieDetector.resolveLanguage({ lookup: '' })

      expect(result).toBeNull()
    })
  })

  describe('cacheUserLanguage', () => {
    test('should set a cookie with the correct value and default attributes', () => {
      cookieDetector.cacheUserLanguage('en', { cache: 'language' })

      expect(document.cookie).toContain('language=en; path=/')
    })

    test('should set a cookie with custom attributes', () => {
      cookieDetector.cacheUserLanguage('en', {
        cache: 'language',
        attributes: { path: '/test', secure: true, sameSite: 'Strict' },
      })

      expect(document.cookie).toContain('language=en; path=/test; secure; sameSite=Strict')
    })

    test('should set a cookie with an expiration date', () => {
      const expiresInDays = 7
      const mockDate = new Date()
      vi.setSystemTime(mockDate)

      cookieDetector.cacheUserLanguage('en', {
        cache: 'language',
        attributes: { expires: expiresInDays },
      })

      const expectedExpiration = new Date(mockDate.getTime() + expiresInDays * 864e5).toUTCString()
      expect(document.cookie).toContain(`expires=${expectedExpiration}`)
    })

    test('should not set a cookie if no cache name is provided', () => {
      cookieDetector.cacheUserLanguage('en', { cache: '' })

      expect(document.cookie).toBe('')
    })
  })
})
