import JSON5 from 'json5'
import { Parser } from './Parser'

export const json5Parser = new Parser({
  ext: 'json5',
  parse(text) {
    return JSON5.parse(text)
  },
})
