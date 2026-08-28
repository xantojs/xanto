import {
  string as vString,
  pipe,
  minLength,
  maxLength,
  length as vLength,
  email as vEmail,
  url as vUrl,
  uuid as vUuid,
  regex as vRegex,
  safeParse,
  type PipeAction,
} from 'valibot'
import type { XantoStringSchema } from '../types/chain.types.js'
import type { StandardResult } from '../../types/schema.types.js'

export function string(message?: string): XantoStringSchema {
  const actions: PipeAction<string, string, any>[] = []
  let defaultValue: string | undefined = undefined
  let isOptional = false

  function validate(value: unknown): StandardResult<string> {
    if (value === undefined && isOptional) {
      return { value: defaultValue as any }
    }

    const valibotSchema = actions.length > 0 ? (pipe as any)(vString(message), ...actions) : vString(message)
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

  const schema: XantoStringSchema = {
    '~standard': {
      version: 1,
      vendor: 'xanto',
      validate,
      types: {
        input: undefined as unknown as string,
        output: undefined as unknown as string,
      },
    },

    min(len: number, msg?: string) {
      actions.push(minLength(len, msg))
      return schema as any
    },

    max(len: number, msg?: string) {
      actions.push(maxLength(len, msg))
      return schema as any
    },

    length(len: number, msg?: string) {
      actions.push(vLength(len, msg))
      return schema as any
    },

    email(msg?: string) {
      actions.push(vEmail(msg))
      return schema as any
    },

    url(msg?: string) {
      actions.push(vUrl(msg))
      return schema as any
    },

    uuid(msg?: string) {
      actions.push(vUuid(msg))
      return schema as any
    },

    regex(pattern: RegExp, msg?: string) {
      actions.push(vRegex(pattern, msg))
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
