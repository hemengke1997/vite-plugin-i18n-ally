export interface Detector<
  L extends Record<string, any> = Record<string, any>,
  C extends Record<string, any> = Record<string, any>,
> {
  name: string
  resolveLanguage: (
    options: {
      lookup: any
      languages: string[]
    } & L,
  ) => string | undefined | null
  cacheUserLanguage?: (
    lng: string,
    options: {
      cache: any
      languages: string[]
    } & C,
  ) => void
}
