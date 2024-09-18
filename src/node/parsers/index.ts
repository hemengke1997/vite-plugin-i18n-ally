import { jsonParser } from './json'
import { json5Parser } from './json5'
import { typescriptParser } from './typescript'
import { yamlParser } from './yaml'

export const DefaultEnabledParsers = [jsonParser, json5Parser, yamlParser, typescriptParser]

export const DefaultParserPlugins = DefaultEnabledParsers.map((t) => t.parser)
