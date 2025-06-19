import { config } from 'virtual:i18n-ally-config'
import { resources } from 'virtual:i18n-ally-empty-resource'

const { namespace, separator } = config

/**
 * 获取所有语言（大小写敏感）
 */
export function getSupportedLngs() {
  if (namespace) {
    return Array.from(
      new Set(
        Object.keys(resources)
          .filter(key => key.includes(separator))
          .map(key => key.split(separator)[0]),
      ),
    )
  }
  return Array.from(new Set(Object.keys(resources).filter(key => !key.includes(separator))))
}

/**
 * 获取所有命名空间（大小写敏感）
 *
 * 如果启用了namespace，则返回 { [lng]: [ns1, ns2] }
 * 否则返回 {}
 */
export function getSupportedNs() {
  if (namespace) {
    const namespaceMap = new Map<string, string[]>()
    Object.keys(resources)
      .filter(key => key.includes(separator))
      .forEach((key) => {
        const [lng, ns] = key.split(separator)
        const namespaces = namespaceMap.get(lng) || []
        namespaces.push(ns)
        namespaceMap.set(lng, namespaces)
      })

    return Object.fromEntries(namespaceMap)
  }
  else {
    return {}
  }
}
