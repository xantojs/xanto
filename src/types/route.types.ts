import type { Methods } from './methods.types.js'
import type { ParsedSegment } from './segment.types.js'

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
  segments: ParsedSegment[]
  priority: number
  middlewares?: string[]
  errorHandler?: string
}

export interface ParsedRoute {
  path: string
  method: Methods
  schema?: unknown
  handler: (...args: any[]) => any
  params?: RouteParam[]
  segments?: ParsedSegment[]
  middlewares?: string[]
  errorHandler?: string
}
