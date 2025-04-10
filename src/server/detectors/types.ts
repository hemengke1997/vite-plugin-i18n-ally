export type ResolveDetectorName<T extends Detector> = T['name']
export type ResolveDetectorLookup<T extends Detector> = Parameters<T['resolveLng']>[0]['lookup']

export type Detections<T, U, D> = D extends undefined ? T : T | U

export interface Detector {
  name: string
  resolveLng: (options: { lookup: any; request: Request; languages: string[] }) => string | undefined | null
  persistLng?: (
    lng: string,
    options: {
      lookup: any
      headers: Headers
    },
  ) => void
}
