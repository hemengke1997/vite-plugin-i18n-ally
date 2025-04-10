import { type Detector } from './types'

const regex = /\/([^\/]*)/g

export class Path implements Detector {
  name = 'path' as const
  resolveLng(options: { lookup: number }) {
    const { lookup: lookupFromPathIndex } = options
    if (typeof window === 'undefined') return undefined

    const language = window.location.pathname.match(regex)
    if (!Array.isArray(language)) return undefined

    const index = typeof lookupFromPathIndex === 'number' ? lookupFromPathIndex : 0
    return language[index]?.replace('/', '')
  }
  persistLng(lng: string, options: { lookup: number | string; languages: string[] }) {
    const { lookup: lookupPathIndex, languages } = options
    const index = typeof lookupPathIndex === 'number' ? lookupPathIndex : 0
    const currentURL = new URL(window.location.href)
    const language = currentURL.pathname.match(regex)
    if (!Array.isArray(language)) return
    if (language[index] === `/${lng}`) return
    const delIndex = languages.some((l) => language[index] === `/${l}`) ? 1 : 0
    language.splice(index, delIndex, `/${lng}`)
    currentURL.pathname = language.join('')
    window.history.replaceState({}, '', currentURL)
  }
}
