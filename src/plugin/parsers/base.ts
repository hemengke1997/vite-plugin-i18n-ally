import fs from 'fs-extra'

export abstract class Parser {
  abstract readonly id: string
  private supportedExtsRegex: RegExp
  constructor(public readonly languageIds: string[], public readonly supportedExts: string) {
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
    return await this.parse(raw)
  }
  abstract parse(text: string): Promise<object>
}
