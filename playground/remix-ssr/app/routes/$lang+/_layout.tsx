import { type ShouldRevalidateFunctionArgs } from '@remix-run/react'
import i18next from 'i18next'
import { resolveNamespace } from '@/i18n/i18n'

let url: URL

export const loader = async () => {
  console.log(url, 'url')

  if (url) {
    await window.asyncLoadResource?.(i18next.language, {
      namespaces: resolveNamespace(url.pathname),
    })
  }
  return null
}

export const shouldRevalidate = ({ nextUrl }: ShouldRevalidateFunctionArgs) => {
  url = nextUrl
  return true
}

export function HydrateFallback() {
  return null
}
