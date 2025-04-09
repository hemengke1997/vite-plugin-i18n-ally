import cookie from 'cookie'
import { type Detector } from './type'

export class Cookie implements Detector {
  name = 'cookie' as const
  resolveLanguage(options: { lookup: string; request: Request }) {
    const { lookup, request } = options
    const cookies = request.headers.get('cookie')
    if (cookies) {
      return cookie.parse(cookies)[lookup]
    }
    return null
  }
}
