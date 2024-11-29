export function ensureArray(arr?: string[] | string) {
  if (!arr) return undefined
  return Array.isArray(arr) ? arr : [arr]
}

export function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const clone = { ...obj }
  keys.forEach((key) => {
    delete clone[key]
  })
  return clone
}
