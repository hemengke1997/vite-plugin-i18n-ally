import fs from 'fs-extra'

export abstract class Parser {
  abstract readonly id: string
  private supportedExtsRegex: RegExp
  constructor(
    public readonly languageIds: string[],
    public readonly supportedExts: string,
  ) {
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
  abstract parse(text: string): Promise<object>
}
