import type { Methods } from './methods.types.js'

export interface RouteParam {
  name: string
  type?: string
  isCatchAll: boolean
}

export interface ScannedRoute {
  path: string
  method: Methods
  filePath: string
  params: RouteParam[]
  priority: number
  middlewares?: string[]
  errorHandler?: string
  entrypoint?: unknown
}

export interface RouteManifest {
  routes: ScannedRoute[]
}
