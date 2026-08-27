import {
  boolean as vBoolean,
  pipe,
  transform,
  unknown as vUnknown,
  safeParse,
  type BaseSchema,
} from 'valibot'
import type { XantoBooleanSchema } from '../types/chain.types.js'
import type { StandardResult } from '../types/schema.types.js'

export function boolean(message?: string): XantoBooleanSchema {
  let isCoerce = false
  let defaultValue: boolean | undefined = undefined
  let isOptional = false

  function validate(value: unknown): StandardResult<boolean> {
    if (value === undefined && isOptional) {
      return { value: defaultValue as any }
    }

    let valibotSchema: BaseSchema<any, any, any>

    if (isCoerce) {
      valibotSchema = pipe(
        vUnknown(),
        transform((val: unknown) => {
          if (val === 'true' || val === '1' || val === 1) return true
          if (val === 'false' || val === '0' || val === 0) return false
          return val
        }),
        vBoolean(message)
      )
    } else {
      valibotSchema = vBoolean(message)
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

  const schema: XantoBooleanSchema = {
    '~standard': {
      version: 1,
      vendor: 'xanto',
      validate,
      types: {
        input: undefined as unknown as boolean,
        output: undefined as unknown as boolean,
      },
    },

    coerce() {
      isCoerce = true
      return schema
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
