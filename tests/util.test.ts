import { describe, expect, test } from 'vitest'
import { ensureArray, formatLanguage, ignoreCaseFind, omit } from '@/client/utils'
import { flatten, ROOT_KEY, unflatten } from '@/node/utils/flat'

describe('util', () => {
  test('should ensure array', () => {
    expect(ensureArray('a')).toEqual(['a'])
    expect(ensureArray(['a'])).toEqual(['a'])
  })

  test('should omit object', () => {
    expect(omit({ a: 1, b: 2 }, ['a'])).toEqual({ b: 2 })
  })

  test('ignoreCaseFind', () => {
    // 浏览器语言
    const navigatorLanguages = ['zh', 'zh-CN', 'en']
    // 支持的语言
    const languages = ['zh-cn', 'en']

    // 忽略大小写时，匹配 zh-CN
    expect(ignoreCaseFind(navigatorLanguages, languages, true)).toEqual('zh-CN')

    // 不忽略大小写时，匹配 en
    expect(ignoreCaseFind(navigatorLanguages, languages, false)).toEqual('en')

    const languages1 = ['zh-cn']
    // 不忽略大小写时，匹配不到
    expect(ignoreCaseFind(navigatorLanguages, languages1, false)).toEqual(undefined)

    // 支持的语言
    const allLanguages = ['zh', 'en', 'zh-CN']
    // 用户语言
    const language = 'zh-cn'

    // 忽略大小写时，匹配 zh-CN
    expect(ignoreCaseFind(allLanguages, language, true)).toEqual('zh-CN')

    // 不忽略大小写时，匹配不到
    expect(ignoreCaseFind(allLanguages, language, false)).toEqual(undefined)
  })

  test('should format languages to lowercase', () => {
    expect(formatLanguage(['zh', 'en', 'zh-CN'], true)).toEqual(['zh', 'en', 'zh-cn'])
  })

  test('should not format languages to lowercase', () => {
    expect(formatLanguage(['zh', 'en', 'zh-CN'], false)).toEqual(['zh', 'en', 'zh-CN'])
  })

  describe('flatten', () => {
    test('basic', () => {
      expect(
        flatten({
          a: { b: { c: 1 } },
        }),
      ).to.eql({
        'a.b.c': 1,
      })
    })

    test('root', () => {
      expect(
        flatten({
          [ROOT_KEY]: 2,
          a: { b: { c: 1, [ROOT_KEY]: 3 } },
        }),
      ).to.eql({
        '': 2,
        'a.b': 3,
        'a.b.c': 1,
      })
    })
  })

  describe('unflatten', () => {
    test('basic', () => {
      expect(
        unflatten({
          'a.b.c': 1,
          'a.b.d': 2,
        }),
      ).to.eql({
        a: {
          b: {
            c: 1,
            d: 2,
          },
        },
      })
    })

    test('root', () => {
      expect(
        unflatten({
          '': 2,
          'a.b': 3,
          'a.b.c': 1,
        }),
      ).to.eql({
        [ROOT_KEY]: 2,
        a: { b: { c: 1, [ROOT_KEY]: 3 } },
      })
    })

    test('keep original value', () => {
      expect(
        unflatten({
          a: {
            b: {
              c: 1,
              d: 2,
            },
          },
        }),
      ).toEqual({
        a: {
          b: {
            c: 1,
            d: 2,
          },
        },
      })
    })
  })
})
