// Taken from vite-plugin-i18n-ally/resolver.ts

import { resources } from 'virtual:i18n-ally-async-resource'
import { config } from 'virtual:i18n-ally-config'

export const separator = '__'

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

export function getNamespaces() {
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
    const r: { [lang: string]: string[] } = {}
    Object.keys(resources).forEach((key) => {
      r[key] = []
    })
    return r
  }
}
