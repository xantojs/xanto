export type InferSchema<T> = T extends { '~standard': { types: { output: infer O } } }
  ? O extends Record<string, unknown>
    ? O
    : Record<string, unknown>
  : T extends { _output: infer O }
    ? O extends Record<string, unknown>
      ? O
      : Record<string, unknown>
    : T extends { _type: infer O }
      ? O extends Record<string, unknown>
        ? O
        : Record<string, unknown>
      : Record<string, unknown>

export type InferHeadersSchema<T> = T extends { '~standard': { types: { output: infer O } } }
  ? O extends Record<string, string | undefined>
    ? O
    : Record<string, string | undefined>
  : T extends { _output: infer O }
    ? O extends Record<string, string | undefined>
      ? O
      : Record<string, string | undefined>
    : T extends { _type: infer O }
      ? O extends Record<string, string | undefined>
        ? O
        : Record<string, string | undefined>
      : Record<string, string | undefined>

export type InferBodySchema<T> = T extends { '~standard': { types: { output: infer O } } }
  ? O
  : T extends { _output: infer O }
    ? O
    : T extends { _type: infer O }
      ? O
      : T extends undefined
        ? unknown
        : T

export interface SafeRouteSchema {
  params?: unknown
  query?: unknown
  headers?: unknown
}

export interface BodyRouteSchema {
  params?: unknown
  query?: unknown
  headers?: unknown
  body?: unknown
}

export type RouteSchema = SafeRouteSchema | BodyRouteSchema
