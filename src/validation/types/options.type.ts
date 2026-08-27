export interface BaseSchemaOptions {
  description?: string
  example?: unknown
}

export interface StringOptions extends BaseSchemaOptions {
  min?: number
  max?: number
  length?: number
  email?: boolean | string
  url?: boolean | string
  uuid?: boolean | string
  regex?: RegExp
  default?: string
  message?: string
}

export interface NumberOptions extends BaseSchemaOptions {
  min?: number
  max?: number
  integer?: boolean
  coerce?: boolean
  default?: number
  message?: string
}
