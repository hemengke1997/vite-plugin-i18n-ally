import { type Detector } from './types'

export class SessionStorage implements Detector {
  name = 'sessionStorage' as const
  lookup(options: { lookup: string }) {
    const { lookup } = options
    return window.sessionStorage.getItem(lookup)
  }
  cacheUserLanguage(lng: string, options: { cache: string }) {
    const { cache } = options
    window.sessionStorage.setItem(cache, lng)
  }
}
