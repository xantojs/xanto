import { createRoute } from './route.js'
import type { Route, SafeRouteOptions, BodyRouteOptions, SafeRouteSchema, BodyRouteSchema } from '../types/routing.types.js'

export function GET<TState extends object = Record<string, unknown>, TSchema extends SafeRouteSchema = SafeRouteSchema>(
  options: SafeRouteOptions<TSchema, TState>
): Route {
  return createRoute('GET', options as any)
}

export function POST<TState extends object = Record<string, unknown>, TSchema extends BodyRouteSchema = BodyRouteSchema>(
  options: BodyRouteOptions<TSchema, TState>
): Route {
  return createRoute('POST', options as any)
}
