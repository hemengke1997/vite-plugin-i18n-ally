// Examples
// {namespaces}/{locale}.json
// {locale}/{namespace}.{ext}
// {locale}/{namespace}/**/*.json
// something/{locale}/{namespace}/**/*.*
export function ParsePathMatcher(pathMatcher: string, exts = '') {
  let regstr = pathMatcher
    .replace(/\./g, '\\.')
    .replace('.*', '..*')
    .replace('*\\.', '.*\\.')
    .replace(/\/?\*\*\//g, '(?:.*/|^)')
    .replace('{locale}', '(?<locale>[\\w-_]+)')
    .replace('{locale?}', '(?<locale>[\\w-_]*?)')
    .replace('{namespace}', '(?<namespace>[^/\\\\]+)')
    .replace('{namespace?}', '(?<namespace>[^/\\\\]*?)')
    .replace('{namespaces}', '(?<namespace>.+)')
    .replace('{namespaces?}', '(?<namespace>.*?)')
    .replace('{ext}', `(?<ext>${exts})`)

  regstr = `^${regstr}$`

  return new RegExp(regstr)
}
