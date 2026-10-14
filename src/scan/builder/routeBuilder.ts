import type { DiscoveredFile } from '../types/scan.types.js'
import type { RouteParam, ScannedRoute } from '../../types/route.types.js'
import { SEGMENT_PRIORITY } from '../const/segmentPriority.const.js'

interface RouteTreeNode {
  segmentRaw: string
  middlewarePath: string | null
  errorPath: string | null
  children: Map<string, RouteTreeNode>
  routes: DiscoveredFile[]
}

function createTreeNode(segmentRaw: string = ''): RouteTreeNode {
  return {
    segmentRaw,
    middlewarePath: null,
    errorPath: null,
    children: new Map(),
    routes: [],
  }
}

export function buildRoutes(files: DiscoveredFile[]): ScannedRoute[] {
  const root = createTreeNode()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const { segments, filename } = file

    let current = root
    for (let s = 0; s < segments.length; s++) {
      const seg = segments[s]!
      const segKey = seg.raw.toLowerCase()

      let next = current.children.get(segKey)
      if (!next) {
        next = createTreeNode(seg.raw)
        current.children.set(segKey, next)
      }
      current = next
    }

    if (filename.kind === 'middleware') {
      current.middlewarePath = file.filePath
    } else if (filename.kind === 'error') {
      current.errorPath = file.filePath
    } else if (filename.kind === 'route') {
      current.routes.push(file)
    }
  }

  const scannedRoutes: ScannedRoute[] = []

  function traverse(
    node: RouteTreeNode,
    inheritedMiddlewares: string[],
    inheritedErrorHandler: string | null
  ) {
    const currentMiddlewares = node.middlewarePath
      ? [...inheritedMiddlewares, node.middlewarePath]
      : inheritedMiddlewares

    const currentErrorHandler = node.errorPath ?? inheritedErrorHandler

    for (let i = 0; i < node.routes.length; i++) {
      const routeFile = node.routes[i]!
      const { segments, filename, filePath } = routeFile

      if (!filename.method) continue

      const pathSegments: string[] = []
      const params: RouteParam[] = []
      let priorityScore = 0

      for (let s = 0; s < segments.length; s++) {
        const seg = segments[s]!
        const weight = SEGMENT_PRIORITY[seg.type]
        priorityScore = priorityScore * 10 + weight

        if (seg.type !== 'group') {
          pathSegments.push(seg.value || '')
        }

        if (seg.paramName) {
          const param: RouteParam = {
            name: seg.paramName,
            isCatchAll: seg.type === 'catch-all',
          }
          if (seg.paramType) {
            param.type = seg.paramType
          }
          params.push(param)
        }
      }

      const rawPath = '/' + pathSegments.join('/')
      const finalPath = rawPath === '//' ? '/' : rawPath.replace(/\/+/g, '/')

      const scannedRoute: ScannedRoute = {
        path: finalPath,
        method: filename.method,
        filePath,
        params,
        priority: priorityScore,
      }

      if (currentMiddlewares.length > 0) {
        scannedRoute.middlewares = currentMiddlewares
      }

      if (currentErrorHandler !== null) {
        scannedRoute.errorHandler = currentErrorHandler
      }

      scannedRoutes.push(scannedRoute)
    }

    for (const childNode of node.children.values()) {
      traverse(childNode, currentMiddlewares, currentErrorHandler)
    }
  }

  traverse(root, [], null)

  scannedRoutes.sort((a, b) => b.priority - a.priority)

  return scannedRoutes
}
