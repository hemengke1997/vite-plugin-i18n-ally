export function ensureArray(arr?: string[] | string) {
  if (!arr)
    return undefined
  return Array.isArray(arr) ? arr : [arr]
}

export function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const clone = { ...obj }
  keys.forEach((key) => {
    delete clone[key]
  })
  return clone
}

/**
 * find。从 source 中找到 target 中的任意一个
 *
 * 如果开启lowerCase小写，则忽略大小写查找
 */
export function findByCase(source: string[], target: string | string[], lowerCase: boolean | undefined) {
  const targets = ensureArray(target) || []

  return source.find(item => targets.some(t => (lowerCase ? item.toLowerCase() === t.toLowerCase() : item === t)))
}

/**
 * 如果开启lowerCase小写，则将语言转为小写
 */
export function formatLng<T>(lng: T, lowerCaseLng: boolean | undefined): T {
  if (Array.isArray(lng)) {
    return lng.map((l: string | undefined) => (lowerCaseLng ? l?.toLowerCase() : l)) as T
  }
  if (lowerCaseLng) {
    return (lng as string | undefined)?.toLowerCase() as T
  }
  return lng
}
