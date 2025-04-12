import { findByCase } from '../../utils/utils'
import { type Detector } from './types'

export class Navigator implements Detector {
  name = 'navigator' as const
  resolveLng = (options: { lngs: string[] }) => {
    if (typeof window.navigator !== 'undefined') {
      // 忽略 navigator.languages 的大小写
      return findByCase((window.navigator?.languages || []) as string[], options.lngs, true)
    }
  }
}
