import { matchRoutes } from '@remix-run/router'
import { i18nOptions } from './i18n'

export async function resolveNamespace(pathname: string = window.location.pathname) {
  const res = await Promise.all<string[]>(
    matchRoutes(window.__remixRouter.routes, pathname)?.map(async (_route) => {
      const { route } = _route
      await route.lazy?.()
      return new Promise<string[]>((resolve) => {
        function r(): string[] {
          if (typeof route?.handle !== 'object') return []
          if (!route.handle) return []
          if (!('i18n' in route.handle)) return []
          if (typeof route.handle.i18n === 'string') return [route.handle.i18n]
          if (Array.isArray(route.handle.i18n) && route.handle.i18n.every((value) => typeof value === 'string')) {
            return route.handle.i18n as string[]
          }
          return []
        }
        setTimeout(() => {
          resolve(r())
        })
      })
    }) || [],
  )

  return res.flatMap((t) => t).concat(i18nOptions.defaultNS)
}
