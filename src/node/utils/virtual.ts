const id = (name: string) => `virtual:i18n-ally-${name}`

const resolvedPrefix = '\0/@i18n-ally/'
const resolve = (id: string) => `${resolvedPrefix}${id}`

const Mods = {
  asyncResource: id('async-resource'),
  resource: id('resource'),
  config: id('config'),
}

export const VirtualModule = {
  id,
  resolvedPrefix,
  resolve,
  Mods,
}
