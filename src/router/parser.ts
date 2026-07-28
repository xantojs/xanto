import { basename, dirname, relative } from 'pathe'

import type { ParsedRoute } from '../types/routing/routing.types.js'
import type { Methods } from '../types/routing/methods.type.js'

function pathToDynamicSegments(path: string) {
  return path.replace(/\[([^\]]+)\]/g, ':$1')
}

export function parseRoute(filePath: string, routesDir: string, method: Methods, module: any): ParsedRoute | null {
  const dirFromRoutes = relative(routesDir, dirname(filePath))
  let path = dirFromRoutes ? `/${dirFromRoutes}` : '/'

  path = pathToDynamicSegments(path)

  return {
    path,
    method,
    handler: module.default,
  }
}
