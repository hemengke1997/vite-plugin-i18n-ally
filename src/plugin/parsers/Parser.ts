import fs from 'fs-extra'

export type ParserConstructor = {
  ext: string
  parse: (text: string) => Promise<object> | object
}

export class Parser {
  private supportedExtsRegex: RegExp

  public readonly supportedExts: string

  constructor(public readonly parser: ParserConstructor) {
    this.supportedExts = parser.ext
    this.supportedExtsRegex = new RegExp(`.?(${this.supportedExts})$`)
  }

  supports(ext: string) {
    return !!this.supportedExtsRegex.test(ext.toLowerCase())
  }

  async load(filepath: string): Promise<object> {
    const raw = fs.readFileSync(filepath, 'utf8')
    if (!raw) {
      return {}
    }
    const res = await this.parse(raw)
    return res
  }

  parse(text: string): Promise<object> | object {
    if (!text || !text.trim()) {
      return {}
    }

    return this.parser.parse(text)
  }
}
