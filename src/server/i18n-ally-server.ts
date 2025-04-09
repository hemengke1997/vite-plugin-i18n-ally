import { formatLanguage } from '@/utils'
import { Cookie } from './detectors/cookie'
import { Header } from './detectors/header'
import { Path } from './detectors/path'
import { QueryString } from './detectors/query-string'
import { type Detections, type Detector, type ResolveDetectorLookup, type ResolveDetectorName } from './detectors/type'

export type I18nAllyServerOptions<D extends Detector[] | undefined = undefined> = {
  /**
   * If detect failed, fallback to `fallbackLng`
   */
  fallbackLng: string
  /**
   * Supported languages
   * @description 语言列表，支持多语言。eg. ['en', 'zh-CN']
   */
  supportedLngs: string[]
  /**
   * Language will be lowercased
   * @description eg. en-US --> en-us
   * @default false
   */
  lowerCaseLng?: boolean
  detection: Detections<
    | {
        detect: ResolveDetectorName<Cookie>
        lookup: ResolveDetectorLookup<Cookie>
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
  private options: I18nAllyServerOptions
  private detectorMap: Map<string, Detector> = new Map()

  constructor(options: I18nAllyServerOptions) {
    this.options = options
    this.options.fallbackLng = this.formatLanguages(this.options.fallbackLng)
    this.options.supportedLngs = this.formatLanguages(this.options.supportedLngs)

    const builtinDetectors = [new Cookie(), new Header(), new Path(), new QueryString()] as Detector[]

    this.detectorMap = new Map<string, Detector>(builtinDetectors.map((detector) => [detector.name, detector]))

    return this
  }

  detect(request: Request) {
    const { detection, fallbackLng } = this.options
    let lang: string = fallbackLng

    if (!detection?.length) return lang

    for (let i = 0; i < detection?.length; i++) {
      const { lookup } = detection[i] as {
        lookup: any
      }

      const detector = this.detectorMap.get(detection[i]?.detect)

      const detectedLang = detector?.resolveLanguage({ lookup, languages: this.options.supportedLngs, request })

      if (detectedLang) {
        lang = this.formatLanguages(detectedLang)
        if (this.options.supportedLngs.includes(lang)) {
          break
        }
      }
    }

    return lang
  }

  private formatLanguages<T>(lang: T): T {
    return formatLanguage(lang, this.options.lowerCaseLng)
  }
}
