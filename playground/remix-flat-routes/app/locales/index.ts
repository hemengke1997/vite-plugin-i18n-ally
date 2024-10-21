import { matchRoutes, type RouteObject } from 'react-router-dom'
import { routes } from 'virtual:remix-flat-routes'

export async function resolveNamespace(pathname = window.location.pathname) {
  const res = await Promise.all(
    matchRoutes(routes as RouteObject[], pathname)?.map(async (route) => {
      const { handle } = route.route
      if (typeof handle === 'function') {
        return await handle()
      }
      return handle
    }),
  )
  return res
    .filter((t) => t?.i18n)
    .map((t) => t.i18n)
    .flat()
}
