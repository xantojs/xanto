import type { H3Event } from 'h3'
import type { Methods } from '../../types/methods.type.js'
import type { SafeContext, BodyContext } from './context.types.js'
import type { RouteSchema, SafeRouteSchema, BodyRouteSchema, InferSchema, InferHeadersSchema, InferBodySchema } from './schema.types.js'

export type { RouteSchema, SafeRouteSchema, BodyRouteSchema, InferSchema, InferHeadersSchema, InferBodySchema }

export type SafeHandler<TSchema extends SafeRouteSchema, TState extends object> = (
  ctx: SafeContext<InferSchema<TSchema['params']>, InferSchema<TSchema['query']>, InferHeadersSchema<TSchema['headers']>, TState>
) => Promise<unknown> | unknown

export type BodyHandler<TSchema extends BodyRouteSchema, TState extends object> = (
  ctx: BodyContext<
    InferBodySchema<TSchema['body']>,
    InferSchema<TSchema['params']>,
    InferSchema<TSchema['query']>,
    InferHeadersSchema<TSchema['headers']>,
    TState
  >
) => Promise<unknown> | unknown

export interface SafeRouteOptions<TSchema extends SafeRouteSchema = SafeRouteSchema, TState extends object = Record<string, unknown>> {
  schema?: TSchema | undefined
  handler: SafeHandler<TSchema, TState>
}

export interface BodyRouteOptions<TSchema extends BodyRouteSchema = BodyRouteSchema, TState extends object = Record<string, unknown>> {
  schema?: TSchema | undefined
  handler: BodyHandler<TSchema, TState>
}

export interface Route {
  method: Methods
  schema?: RouteSchema | undefined
  handler: (event: H3Event) => Promise<unknown>
}

export interface ParsedRoute extends Route {
  path: string
}

