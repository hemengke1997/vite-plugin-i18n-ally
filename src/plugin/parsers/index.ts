import { Json5Parser } from './json5'
import { JsonParser } from './json'
import type { Parser } from './base'

export type EnableParsersType = string[]

export const DefaultEnabledParsers: EnableParsersType = ['json', 'json5']

export const AvailableParsers: Parser[] = [
  // enabled parsers
  new JsonParser(),
  new Json5Parser(),
]
