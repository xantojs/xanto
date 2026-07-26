import type { EventHandler as EventHandlerH3 } from 'h3'

export type EventHandler = EventHandlerH3

export type Methods = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface RouteOptions {
  handler: EventHandler
}

export interface Route {
  method: Methods
  handler: EventHandler
}
