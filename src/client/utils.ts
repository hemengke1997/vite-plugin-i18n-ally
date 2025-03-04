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

export function ignoreCaseIncludes(arr: string[], target: string | string[]) {
  const targets = ensureArray(target) || []
  return arr.some((item) => targets.some((t) => item.toLowerCase() === t.toLowerCase()))
}
