import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { ecmascriptParser } from '@/node/parsers/ecmascript'
import { jsonParser } from '@/node/parsers/json'
import { json5Parser } from '@/node/parsers/json5'
import { yamlParser } from '@/node/parsers/yaml'

const res = {
  hello: 'Hello',
}

const resolveFixture = (p: string) => path.join(__dirname, p)

describe('parsers', () => {
  it('match json', () => {
    expect(jsonParser.supports('json')).toBeTruthy()
    expect(jsonParser.supports('json5')).toBeFalsy()
  })
  it('parse json', async () => {
    await expect(jsonParser.load(resolveFixture('./fixtures/parsers/en.json'))).resolves.toMatchObject(res)
  })

  it('match json5', () => {
    expect(json5Parser.supports('json5')).toBeTruthy()
    expect(json5Parser.supports('json')).toBeFalsy()
  })
  it('parse json5', async () => {
    await expect(json5Parser.load(resolveFixture('./fixtures/parsers/en.json5'))).resolves.toMatchObject(res)
  })

  it('match ts', () => {
    expect(ecmascriptParser.supports('ts')).toBeTruthy()
    expect(ecmascriptParser.supports('mts')).toBeTruthy()
    expect(ecmascriptParser.supports('js')).toBeTruthy()
    expect(ecmascriptParser.supports('mjs')).toBeTruthy()

    expect(ecmascriptParser.supports('json')).toBeFalsy()
    expect(ecmascriptParser.supports('cjs')).toBeFalsy()
  })
  it('parse ts', async () => {
    await expect(ecmascriptParser.load(resolveFixture('./fixtures/parsers/en.ts'))).resolves.toMatchObject(res)
  })

  it('match yaml', () => {
    expect(yamlParser.supports('yaml')).toBeTruthy()
    expect(yamlParser.supports('yml')).toBeTruthy()

    expect(yamlParser.supports('json')).toBeFalsy()
    expect(yamlParser.supports('json5')).toBeFalsy()
  })

  it('parse yaml', async () => {
    expect(yamlParser.supports('yaml')).toBeTruthy()

    await expect(yamlParser.load(resolveFixture('./fixtures/parsers/en.yaml'))).resolves.toMatchObject(res)
  })
})
