import { type ServerRuntimeMetaDescriptor } from '@remix-run/server-runtime'

export function tdk({ t, d, k }: { t?: string; d?: string; k?: string }): ServerRuntimeMetaDescriptor[] {
  return [
    {
      title: t,
    },
    {
      name: 'description',
      content: d,
    },
    {
      name: 'keywords',
      content: k,
    },
  ]
}
