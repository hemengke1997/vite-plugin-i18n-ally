import { type ModuleNode, type ViteDevServer } from 'vite'
import { type LocaleDetector } from '../locale-detector'
import { VirtualModule } from './virtual'

export function fullReload(server: ViteDevServer, localeDetector: LocaleDetector) {
  const { resolvedIds } = localeDetector.localeModules
  const { moduleGraph, ws } = server

  const virtualModules = [...Array.from(resolvedIds.values()), ...Object.values(VirtualModule.Mods)]

  let module: ModuleNode | undefined

  for (const value of virtualModules) {
    module = moduleGraph.getModuleById(VirtualModule.resolve(value))

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
