import { dirname, relative } from 'pathe'

import type { ParsedRoute } from '../server/types/routing.types.js'
import type { Methods } from '../types/methods.type.js'

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
