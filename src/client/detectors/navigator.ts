import { type Detector } from './types'

export class Navigator implements Detector {
  name = 'navigator'
  lookup = (options: { languages: string[] }) => {
    if (typeof window.navigator !== 'undefined') {
      return options.languages.find((l) => window.navigator.languages.includes(l))
    }
  }
}
