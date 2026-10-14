import type { H3Event } from 'h3'
import type { Methods } from '../../types/methods.types.js'
import type { SafeContext, BodyContext } from './context.types.js'
import type { RouteSchema, SafeRouteSchema, BodyRouteSchema, InferSchema, InferHeadersSchema, InferBodySchema } from './schema.types.js'

export type { RouteSchema, SafeRouteSchema, BodyRouteSchema, InferSchema, InferHeadersSchema, InferBodySchema }

export type SafeHandler<TSchema extends SafeRouteSchema> = (
  ctx: SafeContext<
    InferSchema<TSchema['params']>,
    InferSchema<TSchema['query']>,
    InferHeadersSchema<TSchema['headers']>,
    InferSchema<TSchema['state']>
  >
) => Promise<unknown> | unknown

export type BodyHandler<TSchema extends BodyRouteSchema> = (
  ctx: BodyContext<
    InferBodySchema<TSchema['body']>,
    InferSchema<TSchema['params']>,
    InferSchema<TSchema['query']>,
    InferHeadersSchema<TSchema['headers']>,
    InferSchema<TSchema['state']>
  >
) => Promise<unknown> | unknown

export interface SafeRouteOptions<TSchema extends SafeRouteSchema = SafeRouteSchema> {
  schema?: TSchema | undefined
  handler: SafeHandler<TSchema>
}

export interface BodyRouteOptions<TSchema extends BodyRouteSchema = BodyRouteSchema> {
  schema?: TSchema | undefined
  handler: BodyHandler<TSchema>
}

export interface Route {
  method: Methods
  schema?: RouteSchema | undefined
  handler: (event: H3Event) => Promise<unknown>
}

export interface ParsedRoute extends Route {
  path: string
}
