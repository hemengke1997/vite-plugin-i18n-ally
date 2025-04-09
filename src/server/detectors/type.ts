export type ResolveDetectorName<T extends Detector> = T['name']
export type ResolveDetectorLookup<T extends Detector> = Parameters<T['resolveLanguage']>[0]['lookup']

export type Detections<T, U, D> = D extends undefined ? T : T | U

export interface Detector<L extends Record<string, any> = Record<string, any>> {
  name: string
  resolveLanguage: (
    options: {
      lookup: any
      request: Request
      languages: string[]
    } & L,
  ) => string | undefined | null
}
