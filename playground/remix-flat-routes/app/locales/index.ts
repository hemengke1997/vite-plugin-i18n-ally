import { matchRoutes } from 'react-router-dom'
import { routes } from 'virtual:remix-flat-routes'

export function resolveNamespace(pathname = window.location.pathname) {
  return matchRoutes(routes, pathname)
    ?.map((route) => route.route.handle)
    .filter((t) => t?.i18n)
    .map((t) => t.i18n)
    .flat()
}
