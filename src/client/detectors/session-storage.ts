import type { Detector } from './types'

export class SessionStorage implements Detector {
  name = 'sessionStorage' as const
  resolveLng(options: { lookup: string }) {
    const { lookup } = options
    return window.sessionStorage.getItem(lookup)
  }

  persistLng(lng: string, options: { lookup: string }) {
    const { lookup } = options
    window.sessionStorage.setItem(lookup, lng)
  }
}
