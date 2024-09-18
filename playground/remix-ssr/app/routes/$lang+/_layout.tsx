import { type ShouldRevalidateFunctionArgs } from '@remix-run/react'
import i18next from 'i18next'
import { resolveNamespace } from '@/i18n/i18n'

export const clientLoader = () => null

export const shouldRevalidate = async ({ nextUrl }: ShouldRevalidateFunctionArgs) => {
  await window.asyncLoadResource?.(i18next.language, {
    namespaces: [...resolveNamespace(nextUrl.pathname)],
  })
  return true
}

export function HydrateFallback() {
  return null
}
