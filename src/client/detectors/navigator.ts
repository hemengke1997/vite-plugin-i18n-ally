import { ignoreCaseIncludes } from '../utils'
import { type Detector } from './types'

export class Navigator implements Detector {
  name = 'navigator'
  lookup = (options: { languages: string[] }) => {
    if (typeof window.navigator !== 'undefined') {
      // 忽略 navigator.languages 的大小写
      return window.navigator.languages.find((l) => ignoreCaseIncludes(options.languages, l))
    }
  }
}
