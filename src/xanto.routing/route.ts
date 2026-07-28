import type { Methods } from '../types/routing/methods.type.js'
import type { Route, XantoEventHandler } from '../types/routing/routing.types.js'

export function createRoute(method: Methods, handler: XantoEventHandler): Route {
  return {
    method,
    handler,
  }
}
