import { type Detector } from './types'

export class Navigator implements Detector {
  name = 'navigator'
  lookup(_options: { lookup: string }) {
    if (typeof window.navigator !== 'undefined') {
      const { language } = navigator
      return language
    }
  }
}
