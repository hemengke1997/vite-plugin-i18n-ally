import { type Detector } from './types'

export class HtmlTag implements Detector {
  name = 'htmlTag' as const
  resolveLng(options: { lookup: string }) {
    const { lookup } = options
    return document.querySelector('html')?.getAttribute(lookup)
  }
  persistLng(
    lng: string,
    options: {
      lookup: string
    },
  ) {
    const { lookup } = options
    document.querySelector('html')?.setAttribute(lookup, lng)
  }
}
