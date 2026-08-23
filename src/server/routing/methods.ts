import { createRoute } from './route.js'
import type { Route, RouteSchema, SafeRouteOptions, BodyRouteOptions } from '../types/routing.types.js'

export function GET<TState extends object = Record<string, unknown>, TSchema extends RouteSchema = RouteSchema>(
  options: SafeRouteOptions<TSchema, TState>
): Route {
  return createRoute('GET', options as any)
}

export function POST<TState extends object = Record<string, unknown>, TSchema extends RouteSchema = RouteSchema>(
  options: BodyRouteOptions<TSchema, TState>
): Route {
  return createRoute('POST', options as any)
}
