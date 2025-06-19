import fs from 'node:fs'

export interface ParserConstructor {
  ext: string
  parse: (text: string, filepath: string) => Promise<object> | object
}

export class Parser {
  private extRegex: RegExp

  public readonly ext: string

  constructor(public readonly parser: ParserConstructor) {
    this.ext = parser.ext
    this.extRegex = new RegExp(`^\\.?(${this.ext})$`)
  }

  supports(ext: string) {
    return !!ext.toLowerCase().match(this.extRegex)
  }

  async load(filepath: string): Promise<object> {
    const raw = fs.readFileSync(filepath, 'utf8')
    if (!raw) {
      return {}
    }
    try {
      const res = await this.parse(raw, filepath)
      return res
    }
    catch (e) {
      console.error(e)
      return {}
    }
  }

  private parse(text: string, filepath: string): Promise<object> | object {
    if (!text || !text.trim()) {
      return {}
    }

    return this.parser.parse(text, filepath)
  }
}
