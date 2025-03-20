import { resources } from 'virtual:i18n-ally-async-resource'
import { config } from 'virtual:i18n-ally-config'

const { separator } = config

export { separator }

/**
 * 获取所有语言（大小写敏感）
 */
export function getLanguages() {
  if (config.namespace) {
    return Array.from(
      new Set(
        Object.keys(resources)
          .filter((key) => key.includes(separator))
          .map((key) => key.split(separator)[0]),
      ),
    )
  }
  return Array.from(new Set(Object.keys(resources).filter((key) => !key.includes(separator))))
}

/**
 * 获取所有命名空间（大小写敏感）
 *
 * 如果启用了namespace，则返回 { [lang]: [ns1, ns2] }
 * 否则返回 {}
 */
export function getNamespace() {
  if (config.namespace) {
    const namespaceMap = new Map<string, string[]>()
    Object.keys(resources)
      .filter((key) => key.includes(separator))
      .forEach((key) => {
        const [lang, ns] = key.split(separator)
        const namespaces = namespaceMap.get(lang) || []
        namespaces.push(ns)
        namespaceMap.set(lang, namespaces)
      })

    return Object.fromEntries(namespaceMap)
  } else {
    return {}
  }
}
