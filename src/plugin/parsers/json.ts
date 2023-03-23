import { Parser } from './base'

export class JsonParser extends Parser {
  id = 'json'

  constructor() {
    super(['json'], 'json')
  }

  async parse(text: string) {
    if (!text || !text.trim()) {
      return {}
    }
    return JSON.parse(text)
  }
}
