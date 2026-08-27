import {
  number as vNumber,
  pipe,
  minValue,
  maxValue,
  integer as vInteger,
  optional as vOptional,
  transform,
  type BaseSchema,
  type PipeAction,
} from 'valibot'
import { wrapSchema } from '../utils/wrap.util.js'
import type { NumberOptions } from '../types/options.type.js'
import type { StandardSchemaV1 } from '../types/schema.type.js'

export function number(options?: NumberOptions): StandardSchemaV1<number, number> {
  const actions: PipeAction<number, number, any>[] = []

  if (options?.min !== undefined) {
    actions.push(minValue(options.min, typeof options.message === 'string' ? options.message : undefined))
  }

  if (options?.max !== undefined) {
    actions.push(maxValue(options.max, typeof options.message === 'string' ? options.message : undefined))
  }

  if (options?.integer) {
    actions.push(vInteger(typeof options.message === 'string' ? options.message : undefined))
  }

  let baseSchema: BaseSchema<any, any, any> = vNumber(options?.message)

  if (options?.coerce) {
    baseSchema = pipe(
      baseSchema,
      transform((val: unknown) => (typeof val === 'string' ? Number(val) : val))
    )
  }

  let schema: BaseSchema<any, any, any> = actions.length > 0 ? (pipe as any)(baseSchema, ...actions) : baseSchema

  if (options?.default !== undefined) {
    schema = vOptional(schema, options.default)
  }

  return wrapSchema(schema)
}