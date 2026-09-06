import { createRoute } from './route.js'
import type { Route, SafeRouteOptions, BodyRouteOptions, SafeRouteSchema, BodyRouteSchema } from '../types/routing.types.js'

// Safe methods
export function GET<TState extends object = Record<string, unknown>, TSchema extends SafeRouteSchema = SafeRouteSchema>(
  options: SafeRouteOptions<TSchema, TState>
): Route {
  return createRoute('GET', options as any)
}

export function DELETE<TState extends object = Record<string, unknown>, TSchema extends SafeRouteSchema = SafeRouteSchema>(
  options: SafeRouteOptions<TSchema, TState>
): Route {
  return createRoute('DELETE', options as any)
}

export function HEAD<TState extends object = Record<string, unknown>, TSchema extends SafeRouteSchema = SafeRouteSchema>(
  options: SafeRouteOptions<TSchema, TState>
): Route {
  return createRoute('HEAD', options as any)
}

export function OPTIONS<TState extends object = Record<string, unknown>, TSchema extends SafeRouteSchema = SafeRouteSchema>(
  options: SafeRouteOptions<TSchema, TState>
): Route {
  return createRoute('OPTIONS', options as any)
}

// Body methods
export function POST<TState extends object = Record<string, unknown>, TSchema extends BodyRouteSchema = BodyRouteSchema>(
  options: BodyRouteOptions<TSchema, TState>
): Route {
  return createRoute('POST', options as any)
}

export function PUT<TState extends object = Record<string, unknown>, TSchema extends BodyRouteSchema = BodyRouteSchema>(
  options: BodyRouteOptions<TSchema, TState>
): Route {
  return createRoute('PUT', options as any)
}

export function PATCH<TState extends object = Record<string, unknown>, TSchema extends BodyRouteSchema = BodyRouteSchema>(
  options: BodyRouteOptions<TSchema, TState>
): Route {
  return createRoute('PATCH', options as any)
}
