import type { StandardSchemaV1, StandardResult, InferInput, InferOutput } from '../types/schema.types.js'
import type { XantoSchema } from '../types/chain.types.js'

export type ObjectShape = Record<string, StandardSchemaV1<any, any>>

export type InferObjectInput<T extends ObjectShape> = {
  [K in keyof T]: InferInput<T[K]>
}

export type InferObjectOutput<T extends ObjectShape> = {
  [K in keyof T]: InferOutput<T[K]>
}

export interface XantoObjectSchema<Shape extends ObjectShape>
  extends XantoSchema<InferObjectInput<Shape>, InferObjectOutput<Shape>> {
  readonly shape: Shape
}

export function object<Shape extends ObjectShape>(
  shape: Shape,
  message?: string
): XantoObjectSchema<Shape> {
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
