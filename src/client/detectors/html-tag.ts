import { type Detector } from './types'

export class HtmlTag implements Detector {
  name = 'htmlTag' as const
  resolveLanguage(options: { lookup: string }) {
    const { lookup } = options
    return document.querySelector('html')?.getAttribute(lookup)
  }
  cacheUserLanguage(
    lng: string,
    options: {
      cache: string
    },
  ) {
    const { cache } = options
    document.querySelector('html')?.setAttribute(cache, lng)
  }
}
