import { basename, dirname, relative } from 'pathe'

import type { ParsedRoute } from '../types/routing/routing.types.js'
import type { Methods } from '../types/routing/methods.type.js'

const HTTP_METHODS: Methods[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

function extractMethod(filename: string): Methods | null {
  const nameWithoutExt = filename.replace(/\.ts$/, '')

  for (const method of HTTP_METHODS) {
    const methodLower = method.toLowerCase()

    if (nameWithoutExt === methodLower) {
      return method
    }

    if (nameWithoutExt.endsWith(`.${methodLower}`)) {
      return method
    }
  }

  return null
}
function pathToDynamicSegments(path: string) {
  return path.replace(/\[([^\]]+)\]/g, ':$1')
}

export function parseRoute(filePath: string, routesDir: string, module: any): ParsedRoute | null {
  const filename = basename(filePath)
  const method = extractMethod(filename)

  if (!method) {
    return null
  }

  const dirFromRoutes = relative(routesDir, dirname(filePath))
  let path = dirFromRoutes ? `/${dirFromRoutes}` : '/'

  path = pathToDynamicSegments(path)

  return {
    path,
    method,
    handler: module.default,
  }
}
