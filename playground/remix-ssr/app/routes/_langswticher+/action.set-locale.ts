import { type ActionFunction, json } from '@remix-run/node'
import { i18nOptions } from '@/i18n/i18n'
import { createLocaleCookieResolver, localeCookie } from '@/i18n/i18n.server'

export const action: ActionFunction = async ({ request }) => {
  const localeResolver = createLocaleCookieResolver(localeCookie)
  const cookie = await localeResolver(request)
  const { locale } = await request.json()
  return json(
    { success: true },
    {
      headers: await cookie.setLocale(locale || i18nOptions.fallbackLng),
    },
  )
}
