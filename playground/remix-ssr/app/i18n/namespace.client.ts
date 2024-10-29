import { type AgnosticRouteObject, matchRoutes } from '@remix-run/router'
import { routes } from 'virtual:remix-flat-routes'
import { i18nOptions } from './i18n'

export async function resolveNamespace(pathname = window.location.pathname) {
  const res = await Promise.all(
    matchRoutes(routes as AgnosticRouteObject[], pathname)?.map(async (route) => {
      const { handle } = route.route
      if (typeof handle === 'function') {
        return await handle()
      }
      return handle
    }) || [],
  )

  return res
    .filter((t) => t?.i18n)
    .map((t) => t.i18n)
    .flat()
    .concat(i18nOptions.defaultNS)
}
