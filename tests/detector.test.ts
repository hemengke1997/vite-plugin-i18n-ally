// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Cookie } from '@/client/detectors/cookie'
import { HtmlTag } from '@/client/detectors/html-tag'
import { LocalStorage } from '@/client/detectors/local-storage'
import { Navigator } from '@/client/detectors/navigator'
import { Path } from '@/client/detectors/path'
import { QueryString } from '@/client/detectors/query-string'
import { SessionStorage } from '@/client/detectors/session-storage'

describe('htmlTag', () => {
  let htmlTag: HtmlTag

  beforeEach(() => {
    htmlTag = new HtmlTag()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('lookup', () => {
    it('should return the value of the specified attribute if it exists', () => {
      const mockElement = { getAttribute: vi.fn().mockReturnValue('en') }
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement as unknown as HTMLElement)

      const result = htmlTag.resolveLng({ lookup: 'lang' })

      expect(document.querySelector).toHaveBeenCalledWith('html')
      expect(mockElement.getAttribute).toHaveBeenCalledWith('lang')
      expect(result).toBe('en')
    })

    it('should return undefined if the attribute does not exist', () => {
      const mockElement = { getAttribute: vi.fn().mockReturnValue(null) }
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement as unknown as HTMLElement)

      const result = htmlTag.resolveLng({ lookup: 'lang' })

      expect(document.querySelector).toHaveBeenCalledWith('html')
      expect(mockElement.getAttribute).toHaveBeenCalledWith('lang')
      expect(result).toBeFalsy()
    })

    it('should return undefined if no html element is found', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null)

      const result = htmlTag.resolveLng({ lookup: 'lang' })

      expect(document.querySelector).toHaveBeenCalledWith('html')
      expect(result).toBeFalsy()
    })
  })

  describe('persistLng', () => {
    it('should set the specified attribute to the given value', () => {
      const mockElement = { setAttribute: vi.fn() }
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement as unknown as HTMLElement)

      htmlTag.persistLng('en', { lookup: 'lang' })

      expect(document.querySelector).toHaveBeenCalledWith('html')
      expect(mockElement.setAttribute).toHaveBeenCalledWith('lang', 'en')
    })

    it('should do nothing if no html element is found', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null)

      htmlTag.persistLng('en', { lookup: 'lang' })

      expect(document.querySelector).toHaveBeenCalledWith('html')
    })
  })
})

describe('localStorage', () => {
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
    it('should retrieve the correct value from localStorage', () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue('en')

      const result = localStorageDetector.resolveLng({ lookup: 'language' })

      expect(window.localStorage.getItem).toHaveBeenCalledWith('language')
      expect(result).toBe('en')
    })

    it('should return null if the key does not exist in localStorage', () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue(null)

      const result = localStorageDetector.resolveLng({ lookup: 'nonexistent' })

      expect(window.localStorage.getItem).toHaveBeenCalledWith('nonexistent')
      expect(result).toBeNull()
    })

    it('should handle undefined lookup key gracefully', () => {
      const result = localStorageDetector.resolveLng({ lookup: undefined as unknown as string })

      expect(window.localStorage.getItem).toHaveBeenCalledWith(undefined)
      expect(result).toBeNull()
    })
  })

  describe('persistLng', () => {
    it('should set the correct value in localStorage', () => {
      localStorageDetector.persistLng('en', { lookup: 'language' })

      expect(window.localStorage.setItem).toHaveBeenCalledWith('language', 'en')
    })

    it('should overwrite an existing value in localStorage', () => {
      localStorageDetector.persistLng('fr', { lookup: 'language' })

      expect(window.localStorage.setItem).toHaveBeenCalledWith('language', 'fr')
    })

    it('should handle undefined lookup key gracefully', () => {
      localStorageDetector.persistLng('en', { lookup: undefined as unknown as string })

      expect(window.localStorage.setItem).toHaveBeenCalledWith(undefined, 'en')
    })

    it('should handle undefined language value gracefully', () => {
      localStorageDetector.persistLng(undefined as unknown as string, { lookup: 'language' })

      expect(window.localStorage.setItem).toHaveBeenCalledWith('language', undefined)
    })
  })
})

describe('navigator', () => {
  let navigatorDetector: Navigator

  beforeEach(() => {
    navigatorDetector = new Navigator()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('lookup', () => {
    it('should return a matching language from navigator.languages', () => {
      // Mock navigator.languages
      const mockLanguages = ['en-US', 'fr-FR']
      vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(mockLanguages)

      const result = navigatorDetector.resolveLng({ lngs: ['en-us', 'es-ES'] })

      expect(result).toBe('en-US')
    })

    it('should return undefined if no matching language is found', () => {
      // Mock navigator.languages
      const mockLanguages = ['de-DE', 'fr-FR']
      vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(mockLanguages)

      const result = navigatorDetector.resolveLng({ lngs: ['en-us', 'es-ES'] })

      expect(result).toBeFalsy()
    })

    it('should return undefined if navigator.languages is not defined', () => {
      // Mock navigator.languages as undefined
      vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(undefined as any)

      const result = navigatorDetector.resolveLng({ lngs: ['en-us', 'es-ES'] })

      expect(result).toBeFalsy()
    })
  })
})

describe('path', () => {
  let pathDetector: Path

  beforeEach(() => {
    pathDetector = new Path()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('lookup', () => {
    it('should return the language from the specified path index', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        pathname: '/en/about',
      } as Location)

      const result = pathDetector.resolveLng({ lookup: 0 })

      expect(result).toBe('en')
    })

    it('should return undefined if the path index is out of bounds', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        pathname: '/en/about',
      } as Location)

      const result = pathDetector.resolveLng({ lookup: 2 })

      expect(result).toBeUndefined()
    })

    it('should return undefined if window is undefined', () => {
      const originalWindow = global.window
      // Temporarily remove window
      delete (global as any).window

      const result = pathDetector.resolveLng({ lookup: 0 })

      expect(result).toBeUndefined()

      // Restore window
      global.window = originalWindow
    })
  })

  describe('persistLng', () => {
    it('should update the URL with the new language', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        href: 'http://example.com/en/about?q=1',
        pathname: '/en/about',
      } as Location)

      const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {}) // Mock replaceState to do nothing

      pathDetector.persistLng('fr', { lookup: 0, lngs: ['en', 'fr'] })

      expect(replaceStateSpy).toHaveBeenCalledWith({}, '', new URL('/fr/about?q=1', 'http://example.com'))
    })

    it('should do nothing if the language is already set', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        href: 'http://example.com/fr/about',
        pathname: '/fr/about',
      } as Location)

      const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {}) // Mock replaceState to do nothing

      pathDetector.persistLng('fr', { lookup: 0, lngs: ['en', 'fr'] })

      expect(replaceStateSpy).not.toHaveBeenCalled()
    })

    it('should handle cases where the path index is invalid', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        href: 'http://example.com/about',
        pathname: '/about',
      } as Location)

      const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {}) // Mock replaceState to do nothing

      pathDetector.persistLng('fr', { lookup: 0, lngs: ['en', 'fr'] })

      expect(replaceStateSpy).toHaveBeenCalledWith({}, '', new URL('/fr/about', 'http://example.com'))
    })
  })
})

describe('queryString', () => {
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
    it('should return the value of the specified query parameter', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        search: '?lang=en',
      } as Location)

      const result = queryStringDetector.resolveLng({ lookup: 'lang' })

      expect(result).toBe('en')
    })

    it('should return null if the query parameter does not exist', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        search: '?other=123',
      } as Location)

      const result = queryStringDetector.resolveLng({ lookup: 'lang' })

      expect(result).toBeNull()
    })
  })

  describe('persistLng', () => {
    it('should update the query parameter with the new language', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        href: 'http://example.com/?lang=en',
        search: '?lang=en',
      } as Location)

      const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})

      queryStringDetector.persistLng('fr', { lookup: 'lang' })

      vi.advanceTimersToNextTimer()
      expect(replaceStateSpy).toHaveBeenCalledWith({}, '', new URL('http://example.com/?lang=fr'))
    })

    it('should add the query parameter if it does not exist', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        href: 'http://example.com/',
        search: '',
      } as Location)

      const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})

      queryStringDetector.persistLng('fr', { lookup: 'lang' })

      vi.advanceTimersToNextTimer()

      expect(replaceStateSpy).toHaveBeenCalledWith({}, '', new URL('http://example.com/?lang=fr'))
    })
  })
})

describe('sessionStorage', () => {
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
    it('should retrieve the correct value from sessionStorage', () => {
      vi.mocked(window.sessionStorage.getItem).mockReturnValue('en')

      const result = sessionStorageDetector.resolveLng({ lookup: 'language' })

      expect(window.sessionStorage.getItem).toHaveBeenCalledWith('language')
      expect(result).toBe('en')
    })

    it('should return null if the key does not exist in sessionStorage', () => {
      vi.mocked(window.sessionStorage.getItem).mockReturnValue(null)

      const result = sessionStorageDetector.resolveLng({ lookup: 'nonexistent' })

      expect(window.sessionStorage.getItem).toHaveBeenCalledWith('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('persistLng', () => {
    it('should set the correct value in sessionStorage', () => {
      sessionStorageDetector.persistLng('en', { lookup: 'language' })

      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('language', 'en')
    })

    it('should overwrite an existing value in sessionStorage', () => {
      sessionStorageDetector.persistLng('fr', { lookup: 'language' })

      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('language', 'fr')
    })
  })
})

describe('cookie', () => {
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
    it('should return the correct value for a given cookie name', () => {
      document.cookie = 'language=en'

      const result = cookieDetector.resolveLng({ lookup: 'language' })

      expect(result).toBe('en')
    })

    it('should return null if the cookie does not exist', () => {
      document.cookie = 'other=value'

      const result = cookieDetector.resolveLng({ lookup: 'language' })

      expect(result).toBeNull()
    })

    it('should handle cookies with encoded values', () => {
      document.cookie = 'language=%E4%B8%AD%E6%96%87'

      const result = cookieDetector.resolveLng({ lookup: 'language' })

      expect(result).toBe('中文')
    })

    it('should return null if no cookie name is provided', () => {
      const result = cookieDetector.resolveLng({ lookup: '' })

      expect(result).toBeNull()
    })
  })

  describe('persistLng', () => {
    it('should set a cookie with the correct value and default attributes', () => {
      cookieDetector.persistLng('en', { lookup: 'language' })

      expect(document.cookie).toContain('language=en; path=/')
    })

    it('should set a cookie with custom attributes', () => {
      cookieDetector.persistLng('en', {
        lookup: 'language',
        attributes: { path: '/test', secure: true, sameSite: 'Strict' },
      })

      expect(document.cookie).toContain('language=en; path=/test; secure; sameSite=Strict')
    })

    it('should set a cookie with an expiration date', () => {
      const expiresInDays = 7
      const mockDate = new Date()
      vi.setSystemTime(mockDate)

      cookieDetector.persistLng('en', {
        lookup: 'language',
        attributes: { expires: expiresInDays },
      })

      const expectedExpiration = new Date(mockDate.getTime() + expiresInDays * 864e5).toUTCString()
      expect(document.cookie).toContain(`expires=${expectedExpiration}`)
    })

    it('should not set a cookie if no lookup name is provided', () => {
      cookieDetector.persistLng('en', { lookup: '' })

      expect(document.cookie).toBe('')
    })
  })
})
