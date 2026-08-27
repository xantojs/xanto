import {
  number as vNumber,
  pipe,
  minValue,
  maxValue,
  integer as vInteger,
  transform,
  unknown as vUnknown,
  safeParse,
  type PipeAction,
  type BaseSchema,
} from 'valibot'
import type { XantoNumberSchema } from '../types/chain.types.js'
import type { StandardResult } from '../types/schema.types.js'

export function number(message?: string): XantoNumberSchema {
  const actions: PipeAction<number, number, any>[] = []
  let isCoerce = false
  let defaultValue: number | undefined = undefined
  let isOptional = false

  function validate(value: unknown): StandardResult<number> {
    if (value === undefined && isOptional) {
      return { value: defaultValue as any }
    }

    let valibotSchema: BaseSchema<any, any, any>

    if (isCoerce) {
      valibotSchema = (pipe as any)(
        vUnknown(),
        transform((val: unknown) => {
          if (typeof val === 'string' && val.trim() !== '') {
            const num = Number(val)
            return isNaN(num) ? val : num
          }
          return val
        }),
        vNumber(message),
        ...actions
      )
    } else {
      valibotSchema = actions.length > 0 ? (pipe as any)(vNumber(message), ...actions) : vNumber(message)
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

  const schema: XantoNumberSchema = {
    '~standard': {
      version: 1,
      vendor: 'xanto',
      validate,
      types: {
        input: undefined as unknown as number,
        output: undefined as unknown as number,
      },
    },

    min(val: number, msg?: string) {
      actions.push(minValue(val, msg))
      return schema
    },

    max(val: number, msg?: string) {
      actions.push(maxValue(val, msg))
      return schema
    },

    integer(msg?: string) {
      actions.push(vInteger(msg))
      return schema
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