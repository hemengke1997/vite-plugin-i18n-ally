import JSON5 from 'json5'
import { Parser } from './base'

export class Json5Parser extends Parser {
  id = 'json5'

  constructor() {
    super(['json5'], 'json5')
  }

  async parse(text: string) {
    if (!text || !text.trim()) {
      return {}
    }
    return JSON5.parse(text)
  }
}
