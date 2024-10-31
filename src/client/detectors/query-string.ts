import { type Detector } from './types'

export class QueryString implements Detector {
  name = 'querystring'
  lookup(options: { lookup: string }) {
    const { lookup } = options
    const params = new URLSearchParams(window.location.search)
    return params.get(lookup)
  }
  cacheUserLanguage(lng: string, options: { cache: string }) {
    const { cache } = options

    setTimeout(() => {
      const currentURL = new URL(window.location.href)
      currentURL.searchParams.set(cache, lng)
      window.history.replaceState({ path: currentURL.href }, '', currentURL.href)
    })
  }
}