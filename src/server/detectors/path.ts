import type { Detector } from './types'

const regex = /\/([^/]*)/g

export class Path implements Detector {
  name = 'path' as const
  resolveLng(options: { lookup?: number, request: Request }) {
    const { lookup: lookupFromPathIndex, request } = options
    const language = new URL(request.url).pathname.match(regex)
    if (!Array.isArray(language))
      return undefined

    const index = typeof lookupFromPathIndex === 'number' ? lookupFromPathIndex : 0
    return language[index]?.replace('/', '')
  }
}
