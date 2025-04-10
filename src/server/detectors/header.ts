import Negotiator from 'negotiator'
import { findByCase } from '@/utils'
import { type Detector } from './types'

export class Header implements Detector {
  name = 'header' as const
  resolveLng(options: { request: Request; languages: string[] }) {
    const { request } = options

    const languages = new Negotiator({
      headers: {
        'accept-language': request.headers.get('accept-language') || undefined,
      },
    }).languages()

    if (languages?.length) {
      return findByCase(languages, options.languages, true)
    }

    return null
  }
}
