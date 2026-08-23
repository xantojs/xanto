import type { H3Event } from 'h3'
import type { Methods } from '../../types/methods.type.js'
import type { SafeContext, BodyContext } from './context.types.js'

export interface RouteSchema {
  params?: any
  query?: any
  headers?: any
  body?: any
}

export type InferSchema<T> = T extends { _output: infer O } ? O : T extends { _type: infer O } ? O : T

export type SafeHandler<TSchema extends RouteSchema, TState extends object> = (
  ctx: SafeContext<InferSchema<TSchema['params']>, InferSchema<TSchema['query']>, InferSchema<TSchema['headers']>, TState>
) => Promise<unknown> | unknown

export type BodyHandler<TSchema extends RouteSchema, TState extends object> = (
  ctx: BodyContext<
    InferSchema<TSchema['body']>,
    InferSchema<TSchema['params']>,
    InferSchema<TSchema['query']>,
    InferSchema<TSchema['headers']>,
    TState
  >
) => Promise<unknown> | unknown

export interface SafeRouteOptions<TSchema extends RouteSchema = RouteSchema, TState extends object = Record<string, unknown>> {
  schema?: TSchema | undefined
  handler: SafeHandler<TSchema, TState>
}

export interface BodyRouteOptions<TSchema extends RouteSchema = RouteSchema, TState extends object = Record<string, unknown>> {
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
