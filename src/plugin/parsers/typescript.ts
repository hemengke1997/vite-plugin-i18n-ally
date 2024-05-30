import { importx } from 'importx'
import { Parser } from './Parser'

type InteropDefault<T> = T extends { default: infer U } ? U : T

function interopDefault<T>(m: T): InteropDefault<T> {
  return (m as any).default || m
}

export const typescriptParser = new Parser({
  ext: 'm?[t,j]s',
  async parse(_, filepath) {
    const es = await importx(filepath, import.meta.url)
    return interopDefault(es)
  },
})
