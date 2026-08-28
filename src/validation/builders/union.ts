import type { StandardSchemaV1, StandardResult, StandardIssue } from '../types/schema.types.js'
import type { XantoUnionSchema, InferUnionInput, InferUnionOutput } from '../types/chain.types.js'

export function union<const T extends readonly StandardSchemaV1<any, any>[]>(options: T, message?: string): XantoUnionSchema<T> {
  let defaultValue: InferUnionOutput<T> | undefined = undefined
  let isOptional = false

  async function validate(value: unknown): Promise<StandardResult<InferUnionOutput<T>>> {
    if (value === undefined && isOptional) {
      return { value: defaultValue as any }
    }

    const allIssues: StandardIssue[] = []

    for (const schema of options) {
      const result = await schema['~standard'].validate(value)
      if ('value' in result) {
        return { value: result.value as InferUnionOutput<T> }
      }
      if ('issues' in result && result.issues) {
        allIssues.push(...result.issues)
      }
    }

    return {
      issues: [
        {
          message: message ?? 'Value does not match any union schema option',
        },
      ],
    }
  }

  const schema: XantoUnionSchema<T> = {
    options,
    '~standard': {
      version: 1,
      vendor: 'xanto',
      validate,
      types: {
        input: undefined as unknown as InferUnionInput<T>,
        output: undefined as unknown as InferUnionOutput<T>,
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
