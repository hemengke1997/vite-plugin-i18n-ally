import type { I18nAllyClientOptions } from '../client'
import type { Detection, Detections } from '../utils/detect'
import type { Detector, ResolveDetectorLookup, ResolveDetectorName } from './detectors/types'
import { detectLanguage } from '../utils/detect'
import { getSupportedLngs, getSupportedNs } from '../utils/supported'
import { formatLng, omit } from '../utils/utils'
import { Cookie } from './detectors/cookie'
import { Header } from './detectors/header'
import { Path } from './detectors/path'
import { QueryString } from './detectors/query-string'

export type I18nAllyServerOptions<D extends Detector[] | undefined = undefined> = Pick<
  I18nAllyClientOptions,
  'fallbackLng' | 'lngs' | 'lowerCaseLng'
> & {
  detection?: Detections<
    | {
      detect: ResolveDetectorName<Cookie>
      lookup: ResolveDetectorLookup<Cookie>
      attributes?: Cookies.CookieAttributes
      cache?: boolean
    }
    | {
      detect: ResolveDetectorName<Header>
    }
    | {
      detect: ResolveDetectorName<Path>
      lookup?: ResolveDetectorLookup<Path>
    }
    | {
      detect: ResolveDetectorName<QueryString>
      lookup: ResolveDetectorLookup<QueryString>
    },
    D extends Detector[]
      ? {
          detect: ResolveDetectorName<D[number]>
          lookup?: ResolveDetectorLookup<D[number]>
        }
      : undefined,
    D
  >[]
}

export class I18nAllyServer {
  private readonly options: I18nAllyServerOptions
  private detectorMap: Map<string, Detector> = new Map()

  lngs: string[] = []
  fallbackLng: string = ''

  supportedLngs: string[] = getSupportedLngs()

  constructor(options: I18nAllyServerOptions) {
    this.options = options

    this.fallbackLng = this.formatLngs(this.options.fallbackLng)
    this.supportedLngs = this.formatLngs(this.supportedLngs)

    this.lngs = this.formatLngs(this.options.lngs || []).filter(lng => this.supportedLngs.includes(lng))
    if (!this.lngs?.length) {
      this.lngs = this.supportedLngs
    }

    const builtinDetectors = [new Cookie(), new Header(), new Path(), new QueryString()] as Detector[]

    this.detectorMap = new Map<string, Detector>(builtinDetectors.map(detector => [detector.name, detector]))

    return this
  }

  detect(request: Request) {
    return detectLanguage(
      {
        fallbackLng: this.fallbackLng,
        lngs: this.lngs,
        detection: this.options.detection || [],
      },
      ({ lookup, detect }) => {
        const detector = this.detectorMap.get(detect)
        return this.formatLngs(detector?.resolveLng({ lookup, lngs: this.lngs, request }))
      },
    )
  }

  persistLng(lng: string, headers: Headers) {
    const persistDetector = (this.options.detection as Detection[])?.filter(d => d.cache !== false)

    if (!persistDetector?.length)
      return

    persistDetector.forEach(async (d) => {
      const detector = this.detectorMap.get(d.detect)
      detector?.persistLng?.(lng, {
        lookup: d.lookup || 'lng',
        ...omit(d, ['detect', 'lookup', 'cache']),
        headers,
      })
    })
  }

  static getSupportedLngs() {
    return getSupportedLngs()
  }

  static getSupportedNs() {
    return getSupportedNs()
  }

  private formatLngs<T>(lng: T): T {
    return formatLng(lng, this.options.lowerCaseLng)
  }
}
