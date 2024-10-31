import { type Detector } from './types'

const regex = /\/([^\/]*)/g

export class Path implements Detector {
  name = 'path'
  lookup(options: { lookup: number }) {
    const { lookup: lookupFromPathIndex } = options
    if (typeof window === 'undefined') return undefined

    const language = window.location.pathname.match(regex)
    if (!Array.isArray(language)) return undefined

    const index = typeof lookupFromPathIndex === 'number' ? lookupFromPathIndex : 0
    return language[index]?.replace('/', '')
  }
  cacheUserLanguage(lng: string, options: { cache: number }) {
    const { cache: cachePathIndex } = options
    const index = typeof cachePathIndex === 'number' ? cachePathIndex : 0
    const currentURL = new URL(window.location.href)
    const language = currentURL.pathname.match(regex)

    setTimeout(() => {
      if (!Array.isArray(language)) return

      if (language[index] === `/${lng}`) return
      language.splice(index, 0, `/${lng}`)
      currentURL.pathname = language.join('')
      window.history.replaceState({}, '', currentURL)
    })
  }
}
