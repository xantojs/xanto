import type { StandardSchemaV1, InferOutput } from '../../types/schema.types.js'

export type InferSchema<T> = T extends StandardSchemaV1
  ? InferOutput<T> extends Record<string, unknown>
    ? InferOutput<T>
    : Record<string, unknown>
  : Record<string, unknown>

export type InferHeadersSchema<T> = T extends StandardSchemaV1
  ? InferOutput<T> extends Record<string, string | undefined>
    ? InferOutput<T>
    : Record<string, string | undefined>
  : Record<string, string | undefined>

export type InferBodySchema<T> = T extends StandardSchemaV1
  ? InferOutput<T>
  : T extends undefined
    ? unknown
    : T

export interface SafeRouteSchema {
  params?: StandardSchemaV1 | undefined
  query?: StandardSchemaV1 | undefined
  headers?: StandardSchemaV1 | undefined
  state?: StandardSchemaV1 | undefined
}

export interface BodyRouteSchema extends SafeRouteSchema {
  body?: StandardSchemaV1 | undefined
}

export type RouteSchema = SafeRouteSchema | BodyRouteSchema
