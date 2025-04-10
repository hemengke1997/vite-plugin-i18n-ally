export interface Detector<> {
  name: string
  resolveLng: (options: { lookup: any; languages: string[] }) => string | undefined | null
  persistLng?: (
    lng: string,
    options: {
      lookup: any
      languages: string[]
    },
  ) => void
}
