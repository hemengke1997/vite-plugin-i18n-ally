import { Cookie } from './cookie'
import { HtmlTag } from './html-tag'
import { LocalStorage } from './local-storage'
import { Navigator } from './navigator'
import { Path } from './path'
import { QueryString } from './query-string'
import { SessionStorage } from './session-storage'

/**
 * 之所以不做成懒加载，是因为这些 Detector 会在初始化时就被使用
 * 如果懒加载，部分场景下可能会有闪烁问题
 */
export const builtinDetectors = [
  new Cookie(),
  new HtmlTag(),
  new LocalStorage(),
  new Navigator(),
  new Path(),
  new QueryString(),
  new SessionStorage(),
]
