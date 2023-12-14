import { type ViteDevServer } from 'vite'
import { type LocaleDetector } from '../locale-detector/LocaleDetector'
import { RESOLVED_VIRTUAL_PREFIX } from './constant'
import { debug } from './debugger'

export function hmr(server: ViteDevServer, localeDetector: LocaleDetector) {
  const { resolvedIds } = localeDetector.localeModules
  for (const [, value] of resolvedIds) {
    const { moduleGraph, ws } = server
    const module = moduleGraph.getModuleById(RESOLVED_VIRTUAL_PREFIX + value)
    debug('module:', module)

    if (module) {
      moduleGraph.invalidateModule(module)
      if (ws) {
        ws.send({
          type: 'full-reload',
          path: '*',
        })
      }
    }
  }
}
