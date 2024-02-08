declare module 'string.prototype.trimend' {
  export default (str: string, replacer: string) => string
}

declare module 'uniq' {
  const uniq: (arr: string[]) => string[]
  export default uniq
}
