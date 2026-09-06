import { createRoute } from './route.js'
import type { Route, SafeRouteOptions, BodyRouteOptions, SafeRouteSchema, BodyRouteSchema } from '../types/routing.types.js'

// Safe methods (no body)
export function GET<TSchema extends SafeRouteSchema = SafeRouteSchema>(
  options: SafeRouteOptions<TSchema>
): Route {
  return createRoute('GET', options as any)
}

export function DELETE<TSchema extends SafeRouteSchema = SafeRouteSchema>(
  options: SafeRouteOptions<TSchema>
): Route {
  return createRoute('DELETE', options as any)
}

export function HEAD<TSchema extends SafeRouteSchema = SafeRouteSchema>(
  options: SafeRouteOptions<TSchema>
): Route {
  return createRoute('HEAD', options as any)
}

export function OPTIONS<TSchema extends SafeRouteSchema = SafeRouteSchema>(
  options: SafeRouteOptions<TSchema>
): Route {
  return createRoute('OPTIONS', options as any)
}

// Body methods
export function POST<TSchema extends BodyRouteSchema = BodyRouteSchema>(
  options: BodyRouteOptions<TSchema>
): Route {
  return createRoute('POST', options as any)
}

export function PUT<TSchema extends BodyRouteSchema = BodyRouteSchema>(
  options: BodyRouteOptions<TSchema>
): Route {
  return createRoute('PUT', options as any)
}

export function PATCH<TSchema extends BodyRouteSchema = BodyRouteSchema>(
  options: BodyRouteOptions<TSchema>
): Route {
  return createRoute('PATCH', options as any)
}
