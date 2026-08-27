import {
  picklist,
  safeParse,
} from 'valibot'
import type { XantoEnumSchema } from '../types/chain.types.js'
import type { StandardResult } from '../types/schema.types.js'

export function enumType<const T extends readonly string[]>(
  options: T,
  message?: string
): XantoEnumSchema<T> {
  let defaultValue: T[number] | undefined = undefined
  let isOptional = false

  const valibotSchema = picklist(options as any, message)

  function validate(value: unknown): StandardResult<T[number]> {
    if (value === undefined && isOptional) {
      return { value: defaultValue as any }
    }

    const result = safeParse(valibotSchema, value)

    if (result.success) {
      return { value: result.output }
    }

    return {
      issues: result.issues.map((issue) => ({
        message: issue.message,
        path: issue.path?.map((item: any) => item.key as string | number),
      })),
    }
  }

  const schema: XantoEnumSchema<T> = {
    options,
    '~standard': {
      version: 1,
      vendor: 'xanto',
      validate,
      types: {
        input: undefined as unknown as T[number],
        output: undefined as unknown as T[number],
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
