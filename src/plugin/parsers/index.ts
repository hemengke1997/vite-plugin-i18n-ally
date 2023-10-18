import { jsonParser } from './json'
import { json5Parser } from './json5'
import { yamlParser } from './yaml'

export const DefaultEnabledParsers = [jsonParser, json5Parser, yamlParser]
