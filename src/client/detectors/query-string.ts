import type { Detector } from './types'

export class QueryString implements Detector {
  name = 'querystring' as const
  resolveLng(options: { lookup: string }) {
    const { lookup } = options
    const params = new URLSearchParams(window.location.search)
    return params.get(lookup)
  }

  persistLng(lng: string, options: { lookup: string }) {
    const { lookup } = options

    // setTimeout for next tick
    // useful in react-router-dom
    setTimeout(() => {
      const currentURL = new URL(window.location.href)
      currentURL.searchParams.set(lookup, lng)
      window.history.replaceState({}, '', currentURL)
    })
  }
}
