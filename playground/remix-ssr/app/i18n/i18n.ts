import { type AgnosticRouteObject, matchRoutes } from '@remix-run/router'
import { routes } from 'virtual:remix-flat-routes'

const fallbackLng = 'en'
const defaultNS = ['common']

export const i18nOptions = {
  fallbackLng,
  defaultNS,
  nsSeparator: '.',
  keySeparator: '.',
}

export function resolveNamespace(pathname = window.location.pathname): string[] {
  return (
    matchRoutes(routes as AgnosticRouteObject[], pathname)
      ?.map((route) => route.route.handle)
      .filter((t) => t?.i18n)
      .map((t) => t.i18n)
      .flat()
      .concat(defaultNS) || defaultNS
  )
}
