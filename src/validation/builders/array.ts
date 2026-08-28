import type { StandardSchemaV1, StandardResult, InferInput, InferOutput } from '../../types/schema.types.js'
import type { XantoArraySchema } from '../types/chain.types.js'

export function array<ItemSchema extends StandardSchemaV1<any, any>>(
  itemSchema: ItemSchema,
  message?: string
): XantoArraySchema<InferInput<ItemSchema>, InferOutput<ItemSchema>> {
  let minLength: number | undefined = undefined
  let maxLength: number | undefined = undefined
  let exactLength: number | undefined = undefined
  let defaultValue: InferOutput<ItemSchema>[] | undefined = undefined
  let isOptional = false

  async function validate(value: unknown): Promise<StandardResult<InferOutput<ItemSchema>[]>> {
    if (value === undefined && isOptional) {
      return { value: defaultValue as any }
    }

    if (!Array.isArray(value)) {
      return {
        issues: [{ message: message ?? 'Expected array' }],
      }
    }

    if (minLength !== undefined && value.length < minLength) {
      return {
        issues: [{ message: message ?? `Array must contain at least ${minLength} items` }],
      }
    }

    if (maxLength !== undefined && value.length > maxLength) {
      return {
        issues: [{ message: message ?? `Array must contain at most ${maxLength} items` }],
      }
    }

    if (exactLength !== undefined && value.length !== exactLength) {
      return {
        issues: [{ message: message ?? `Array must contain exactly ${exactLength} items` }],
      }
    }

    const outputs: InferOutput<ItemSchema>[] = []
    const issues: { message: string; path?: (string | number)[] }[] = []

    for (let i = 0; i < value.length; i++) {
      const itemResult = await itemSchema['~standard'].validate(value[i])
      if ('issues' in itemResult && itemResult.issues) {
        for (const issue of itemResult.issues) {
          issues.push({
            message: issue.message,
            path: [i, ...((issue.path ?? []) as (string | number)[])],
          })
        }
      } else if ('value' in itemResult) {
        outputs.push(itemResult.value)
      }
    }

    if (issues.length > 0) {
      return { issues }
    }

    return { value: outputs }
  }

  const schema: XantoArraySchema<InferInput<ItemSchema>, InferOutput<ItemSchema>> = {
    '~standard': {
      version: 1,
      vendor: 'xanto',
      validate,
      types: {
        input: undefined as unknown as InferInput<ItemSchema>[],
        output: undefined as unknown as InferOutput<ItemSchema>[],
      },
    },

    min(len: number) {
      minLength = len
      return schema
    },

    max(len: number) {
      maxLength = len
      return schema
    },

    length(len: number) {
      exactLength = len
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
