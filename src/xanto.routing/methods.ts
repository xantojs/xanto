import { createRoute } from './route.js'
import type { RouteOptions } from './routing.type.js'

export function GET(options: RouteOptions) {
  return createRoute('GET', options.handler)
}

export function POST(options: RouteOptions) {
  return createRoute('POST', options.handler)
}
