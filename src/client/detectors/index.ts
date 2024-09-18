import { Cookie } from './cookie'
import { HtmlTag } from './html-tag'
import { LocalStorage } from './local-storage'
import { Navigator } from './navigator'
import { Path } from './path'
import { QueryString } from './query-string'
import { SessionStorage } from './session-storage'
import { type Detector } from './types'

export const detectors = [
  new Cookie(),
  new HtmlTag(),
  new LocalStorage(),
  new Navigator(),
  new Path(),
  new QueryString(),
  new SessionStorage(),
]

export const detectorsMap = new Map<string, Detector>(detectors.map((detector) => [detector.name, detector]))

export type Detection = {
  detect: string
  lookup?: string
  cache?: boolean
} & Record<string, any>
