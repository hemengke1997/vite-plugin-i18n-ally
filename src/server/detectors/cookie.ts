import type { Detector } from './types'
import cookie from 'cookie'

export class Cookie implements Detector {
  name = 'cookie' as const
  resolveLng(options: { lookup: string, request: Request }) {
    const { lookup, request } = options
    const cookies = request.headers.get('cookie')
    if (cookies) {
      return cookie.parse(cookies)[lookup]
    }
    return null
  }

  persistLng(
    lng: string,
    options: {
      lookup: string
      attribute?: cookie.SerializeOptions
      headers: Headers
    },
  ) {
    const { attribute, lookup, headers } = options
    const serializedCookie = cookie.serialize(lookup, lng, {
      path: '/',
      httpOnly: false,
      ...attribute,
    })
    headers?.append('Set-Cookie', serializedCookie)
  }
}
