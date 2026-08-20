import type { Methods } from '../../types/methods.type.js'
import type { Route, XantoEventHandler } from '../types/routing.types.js'

export function createRoute(method: Methods, handler: XantoEventHandler): Route {
  return {
    method,
    handler,
  }
}
