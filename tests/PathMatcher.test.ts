import { describe, expect, test } from 'vitest'
import { ParsePathMatcher } from '../src/node/path-matcher'

describe('PathMatching', () => {
  const cases = [
    ['{namespace}/**/{locale}.json', 'moduleC/nested/locales/zh-cn.json', 'moduleC', 'zh-cn'],
    ['{namespace}/locales/{locale}.json', 'moduleC/locales/zh-cn.json', 'moduleC', 'zh-cn'],
    ['{namespaces}/{locale}.json', 'modules/nested/en.json', 'modules/nested', 'en'],
    ['{namespaces}/{locale}.json', 'modules/nested/en.js', null],
    ['{namespaces}/{locale}.(json|yml)', 'modules/nested/en.yml', 'modules/nested', 'en'],
    ['{namespace}/{locale}.*', 'nested/en.whatever', 'nested', 'en'],
    ['{namespaces?}/{locale}.*', 'nested/en.whatever', 'nested', 'en'],
    ['{namespaces?}/?{locale}.*', 'en.whatever', '', 'en'],
    ['{locale}/{namespaces}.*', 'zh-cn/hello/world/messages.json', 'hello/world/messages', 'zh-cn'],
    ['{locale}/modules/{namespaces}.*', 'jp/modules/hello/world.json', 'hello/world', 'jp'],
    ['{locale}/modules/*.*', 'jp/modules/a.json', undefined, 'jp'],
    ['{locale}/modules/*.js', 'jp/modules/a.js', undefined, 'jp'],
    ['**/{locale}.json', 'fr.json', undefined, 'fr'],
    ['hello/**/{locale}.json', 'hello/fr.json', undefined, 'fr'],
    ['nls.?{locale?}.json', 'nls.json', undefined, ''],
  ] as const

  for (const [map, path, expectedNamespace, expectedLocale] of cases) {
    test(map, () => {
      const re = ParsePathMatcher(map)
      const result = re.exec(path)

      if (!result) {
        expect(expectedNamespace).toStrictEqual(null)
      } else {
        expect(result.groups?.namespace).toStrictEqual(expectedNamespace)
        expect(result.groups?.locale).toStrictEqual(expectedLocale)
      }
    })
  }
})
