import { describe, expect, test } from 'vitest'
import { ignoreCaseIncludes } from '@/client/utils'

describe('util', () => {
  test('ignoreCaseIncludes', () => {
    const navigatorLanguages = ['zh', 'zh-CN', 'en']
    const languages = ['zh-cn', 'en']

    expect(navigatorLanguages.find((l) => ignoreCaseIncludes(languages, l))).toStrictEqual('zh-CN')
  })
})
