import { type Detector } from './types'

export class LocalStorage implements Detector {
  name = 'localStorage'
  lookup(options: { lookup: string }) {
    const { lookup } = options
    return window.localStorage.getItem(lookup)
  }
  cacheUserLanguage(lng: string, options: { cache: string }) {
    const { cache } = options
    window.localStorage.setItem(cache, lng)
  }
}
