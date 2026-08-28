import { literal as vLiteral, safeParse } from 'valibot'
import type { XantoLiteralSchema } from '../types/chain.types.js'
import type { StandardResult } from '../../types/schema.types.js'

export function literal<const T extends string | number | boolean>(expectedValue: T, message?: string): XantoLiteralSchema<T> {
  let defaultValue: T | undefined = undefined
  let isOptional = false

  const valibotSchema = vLiteral(expectedValue, message)

  function validate(value: unknown): StandardResult<T> {
    if (value === undefined && isOptional) {
      return { value: defaultValue as any }
    }

    const result = safeParse(valibotSchema, value)

    if (result.success) {
      return { value: result.output as T }
    }

    return {
      issues: result.issues.map((issue) => ({
        message: issue.message,
        path: issue.path?.map((item: any) => item.key as string | number),
      })),
    }
  }

  const schema: XantoLiteralSchema<T> = {
    literalValue: expectedValue,
    '~standard': {
      version: 1,
      vendor: 'xanto',
      validate,
      types: {
        input: undefined as unknown as T,
        output: undefined as unknown as T,
      },
    },

    optional(def?: any) {
      isOptional = true
      if (def !== undefined) defaultValue = def
      return schema as any
    },

    default(def: any) {
      return schema.optional(def)
    },
  }

  return schema
}
