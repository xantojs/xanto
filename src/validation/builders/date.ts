import {
  date as vDate,
  pipe,
  minValue,
  maxValue,
  transform,
  unknown as vUnknown,
  safeParse,
  type PipeAction,
  type BaseSchema,
} from 'valibot'
import type { XantoDateSchema } from '../types/chain.types.js'
import type { StandardResult } from '../../types/schema.types.js'

export function date(message?: string): XantoDateSchema {
  const actions: PipeAction<Date, Date, any>[] = []
  let isCoerce = false
  let defaultValue: Date | undefined = undefined
  let isOptional = false

  function validate(value: unknown): StandardResult<Date> {
    if (value === undefined && isOptional) {
      return { value: defaultValue as any }
    }

    let valibotSchema: BaseSchema<any, any, any>

    if (isCoerce) {
      valibotSchema = (pipe as any)(
        vUnknown(),
        transform((val: unknown) => {
          if (typeof val === 'string' || typeof val === 'number') {
            const parsed = new Date(val)
            return isNaN(parsed.getTime()) ? val : parsed
          }
          return val
        }),
        vDate(message),
        ...actions
      )
    } else {
      valibotSchema = actions.length > 0 ? (pipe as any)(vDate(message), ...actions) : vDate(message)
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

  const schema: XantoDateSchema = {
    '~standard': {
      version: 1,
      vendor: 'xanto',
      validate,
      types: {
        input: undefined as unknown as Date | string,
        output: undefined as unknown as Date,
      },
    },

    min(minDate: Date, msg?: string) {
      actions.push(minValue(minDate, msg))
      return schema
    },

    max(maxDate: Date, msg?: string) {
      actions.push(maxValue(maxDate, msg))
      return schema
    },

    coerce() {
      isCoerce = true
      return schema as any
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
