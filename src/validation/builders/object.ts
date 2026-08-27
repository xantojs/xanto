import type { StandardResult } from '../types/schema.types.js'
import type { ObjectShape, InferObjectInput, InferObjectOutput, XantoObjectSchema } from '../types/chain.types.js'

export function object<Shape extends ObjectShape>(shape: Shape, message?: string): XantoObjectSchema<Shape> {
  let defaultValue: InferObjectOutput<Shape> | undefined = undefined
  let isOptional = false

  async function validate(value: unknown): Promise<StandardResult<InferObjectOutput<Shape>>> {
    if (value === undefined && isOptional) {
      return { value: defaultValue as any }
    }

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return {
        issues: [{ message: message ?? 'Expected object' }],
      }
    }

    const output: Record<string, any> = {}
    const issues: { message: string; path?: (string | number)[] }[] = []
    const record = value as Record<string, unknown>

    for (const [key, fieldSchema] of Object.entries(shape)) {
      const val = record[key]
      const fieldResult = await fieldSchema['~standard'].validate(val)

      if ('issues' in fieldResult && fieldResult.issues) {
        for (const issue of fieldResult.issues) {
          issues.push({
            message: issue.message,
            path: [key, ...((issue.path ?? []) as (string | number)[])],
          })
        }
      } else if ('value' in fieldResult) {
        output[key] = fieldResult.value
      }
    }

    if (issues.length > 0) {
      return { issues }
    }

    return { value: output as InferObjectOutput<Shape> }
  }

  const schema: XantoObjectSchema<Shape> = {
    shape,
    '~standard': {
      version: 1,
      vendor: 'xanto',
      validate,
      types: {
        input: undefined as unknown as InferObjectInput<Shape>,
        output: undefined as unknown as InferObjectOutput<Shape>,
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
