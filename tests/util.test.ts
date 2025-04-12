import { describe, expect, it } from 'vitest'
import { flatten, ROOT_KEY, unflatten } from '@/node/utils/flat'
import { ensureArray, findByCase, formatLng, omit } from '@/utils/utils'

describe('util', () => {
  it('should ensure array', () => {
    expect(ensureArray('a')).toEqual(['a'])
    expect(ensureArray(['a'])).toEqual(['a'])
  })

  it('should omit object', () => {
    expect(omit({ a: 1, b: 2 }, ['a'])).toEqual({ b: 2 })
  })

  it('findByCase', () => {
    // 浏览器语言
    const navigatorLanguages = ['zh', 'zh-CN', 'en']
    // 支持的语言
    const languages = ['zh-cn', 'en']

    // 忽略大小写时，匹配 zh-CN
    expect(findByCase(navigatorLanguages, languages, true)).toEqual('zh-CN')

    // 不忽略大小写时，匹配 en
    expect(findByCase(navigatorLanguages, languages, false)).toEqual('en')

    const languages1 = ['zh-cn']
    // 不忽略大小写时，匹配不到
    expect(findByCase(navigatorLanguages, languages1, false)).toEqual(undefined)

    // 支持的语言
    const allLanguages = ['zh', 'en', 'zh-CN']
    // 用户语言
    const language = 'zh-cn'

    // 忽略大小写时，匹配 zh-CN
    expect(findByCase(allLanguages, language, true)).toEqual('zh-CN')

    // 不忽略大小写时，匹配不到
    expect(findByCase(allLanguages, language, false)).toEqual(undefined)
  })

  it('should format languages to lowercase', () => {
    expect(formatLng(['zh', 'en', 'zh-CN'], true)).toEqual(['zh', 'en', 'zh-cn'])
  })

  it('should not format languages to lowercase', () => {
    expect(formatLng(['zh', 'en', 'zh-CN'], false)).toEqual(['zh', 'en', 'zh-CN'])
  })

  describe('flatten', () => {
    it('basic', () => {
      expect(
        flatten({
          a: { b: { c: 1 } },
        }),
      ).to.eql({
        'a.b.c': 1,
      })
    })

    it('root', () => {
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
    it('basic', () => {
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

    it('root', () => {
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

    it('keep original value', () => {
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
