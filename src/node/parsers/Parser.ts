import fs from 'node:fs'

export type ParserConstructor = {
  ext: string
  parse: (text: string, filepath: string) => Promise<object> | object
}

export class Parser {
  private supportedExtsRegex: RegExp

  public readonly supportedExts: string

  constructor(public readonly parser: ParserConstructor) {
    this.supportedExts = parser.ext
    this.supportedExtsRegex = new RegExp(`.?(${this.supportedExts})$`)
  }

  supports(ext: string) {
    return !!ext.toLowerCase().match(this.supportedExtsRegex)
  }

  async load(filepath: string): Promise<object> {
    const raw = fs.readFileSync(filepath, 'utf8')
    if (!raw) {
      return {}
    }
    try {
      const res = await this.parse(raw, filepath)
      return res
    } catch {
      return {}
    }
  }

  parse(text: string, filepath: string): Promise<object> | object {
    if (!text || !text.trim()) {
      return {}
    }

    return this.parser.parse(text, filepath)
  }
}
