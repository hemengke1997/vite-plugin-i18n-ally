import { type Detector } from './types'

export class Navigator implements Detector {
  name = 'navigator'
  lookup = (options: { languages: string[] }) => {
    if (typeof window.navigator !== 'undefined') {
      return window.navigator.languages.find((l) => options.languages.includes(l))
    }
  }
}
