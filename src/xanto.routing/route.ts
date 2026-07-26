import type {  EventHandler } from './routing.type.js'
import type { Route, Methods } from './routing.type.js'

export function createRoute(method: Methods, handler: EventHandler): Route {
  return {
    method,
    handler,
  }
}
