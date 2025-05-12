import { type BaseDetector } from '../../utils/detect'

export type ResolveDetectorName<T extends Detector> = T['name']
export type ResolveDetectorLookup<T extends Detector> = Parameters<T['resolveLng']>[0]['lookup']

export type Detector = BaseDetector<
  {
    request: Request
  },
  {
    headers: Headers
  }
>
