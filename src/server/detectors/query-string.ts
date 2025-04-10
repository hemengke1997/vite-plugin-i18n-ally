import { type Detector } from './types'

export class QueryString implements Detector {
  name = 'querystring' as const
  resolveLng(options: { lookup: string; request: Request }) {
    const { lookup, request } = options

    const url = new URL(request.url)
    const searchParams = url.searchParams.get(lookup)

    if (searchParams) {
      return searchParams
    }
    return null
  }
}
