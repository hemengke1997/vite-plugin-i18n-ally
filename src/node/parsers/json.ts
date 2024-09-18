import { Parser } from './Parser'

export const jsonParser = new Parser({
  ext: 'json',
  parse(text) {
    return JSON.parse(text)
  },
})
