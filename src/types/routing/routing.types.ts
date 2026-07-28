import type { EventHandler as EventHandlerH3 } from 'h3'
import type { Methods } from './methods.type.js'

export type XantoEventHandler = EventHandlerH3

export interface RouteOptions {
  handler: XantoEventHandler
}

export interface Route {
  method: Methods
  handler: XantoEventHandler
}

export interface ParsedRoute extends Route {
  path: string
}
