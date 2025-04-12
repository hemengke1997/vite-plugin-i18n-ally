export type Detection = {
  detect: string
  lookup?: any
  cache?: boolean
} & Record<string, any>

export type Detections<T, U, D> = D extends undefined ? T : T | U

export interface BaseDetector<
  T extends Record<string, any> = Record<string, any>,
  U extends Record<string, any> = Record<string, any>,
> {
  name: string
  resolveLng: (
    options: {
      lookup: any
      lngs: string[]
    } & T,
  ) => string | undefined | null
  persistLng?: (
    lng: string,
    options: {
      lookup: any
    } & U,
  ) => void
}

export function detectLanguage<T extends Detection | undefined>(
  {
    detection,
    fallbackLng,
    lngs,
  }: {
    detection: T[]
    fallbackLng: string
    lngs: string[]
  },
  onDetect: ({ detect, lookup }: { lookup: unknown | undefined; detect: string }) => string | null | undefined,
): string {
  let lng: string = fallbackLng

  if (!detection?.length) return lng

  for (let i = 0; i < detection.length; i++) {
    const current = detection[i]
    if (!current) continue

    if (!current.detect) continue

    const detectedLang = onDetect({ lookup: current.lookup, detect: current.detect })

    if (detectedLang && lngs.includes(detectedLang)) {
      lng = detectedLang
      break
    }
  }

  return lng
}
