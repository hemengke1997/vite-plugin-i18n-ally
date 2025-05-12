const id = (name: string) => `virtual:i18n-ally-${name}`

const resolvedPrefix = '\0/@i18n-ally/'
const resolve = (id: string) => `${resolvedPrefix}${id}`

const Mods = {
  /**
   * 异步资源，支持动态导入
   */
  asyncResource: id('async-resource'),
  /**
   * 同步资源，包含所有语言的资源
   */
  resource: id('resource'),
  /**
   * 无内容的资源，用于获取语言、ns列表
   */
  emptyResource: id('empty-resource'),
  /**
   * 配置文件，包含namespace和separator
   */
  config: id('config'),
}

export const VirtualModule = {
  id,
  resolvedPrefix,
  resolve,
  Mods,
}
