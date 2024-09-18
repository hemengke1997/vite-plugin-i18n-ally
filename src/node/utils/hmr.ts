import { type ModuleNode, type ViteDevServer } from 'vite'
import { type LocaleDetector } from '../locale-detector'
import { ASYNC_RESOURCE, RESOLVED_VIRTUAL_PREFIX, RESOURCE } from './constant'

export function fullReload(server: ViteDevServer, localeDetector: LocaleDetector) {
  const { resolvedIds } = localeDetector.localeModules
  const { moduleGraph, ws } = server

  const virtualModules = [...Array.from(resolvedIds.values()), ASYNC_RESOURCE, RESOURCE]

  let module: ModuleNode | undefined

  for (const value of virtualModules) {
    module = moduleGraph.getModuleById(RESOLVED_VIRTUAL_PREFIX + value)

    if (module) {
      moduleGraph.invalidateModule(module)
    }
  }

  if (ws) {
    ws.send({
      type: 'full-reload',
      path: '*',
    })
  }
}
