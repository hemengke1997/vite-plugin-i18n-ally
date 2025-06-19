import type { Detector } from './types'

export class LocalStorage implements Detector {
  name = 'localStorage' as const
  resolveLng(options: { lookup: string }) {
    const { lookup } = options
    return window.localStorage.getItem(lookup)
  }

  persistLng(lng: string, options: { lookup: string }) {
    const { lookup } = options
    window.localStorage.setItem(lookup, lng)
  }
}
