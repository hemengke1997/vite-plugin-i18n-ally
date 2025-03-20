import { ignoreCaseFind } from '../utils'
import { type Detector } from './types'

export class Navigator implements Detector {
  name = 'navigator'
  lookup = (options: { languages: string[] }) => {
    if (typeof window.navigator !== 'undefined') {
      // 忽略 navigator.languages 的大小写
      return ignoreCaseFind(window.navigator.languages as string[], options.languages, true)
    }
  }
}
