import YAML from 'js-yaml'
import { Parser } from './Parser'

export const yamlParser = new Parser({
  ext: 'ya?ml',
  async parse(text: string) {
    return YAML.load(text)
  },
})
