import type { BaseDetector } from '../../utils/detect'

export type Detector = BaseDetector<
  Record<string, any>,
  {
    lngs: string[]
  }
>
