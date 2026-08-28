import type { StandardSchemaV1, StandardResult } from '../../types/schema.types.js'
import type { XantoSchema } from '../types/chain.types.js'

export function createBaseChain<Input, Output>(
  validateFn: (value: unknown) => StandardResult<Output> | Promise<StandardResult<Output>>
): XantoSchema<Input, Output> {
  const schema: XantoSchema<Input, Output> = {
    '~standard': {
      version: 1,
      vendor: 'xanto',
      validate: validateFn,
      types: {
        input: undefined as unknown as Input,
        output: undefined as unknown as Output,
      },
    },
    optional(defaultValue?: any) {
      return createBaseChain((value: unknown) => {
        if (value === undefined) {
          return { value: defaultValue !== undefined ? defaultValue : undefined }
        }
        return validateFn(value)
      }) as any
    },
    default(defaultValue: any) {
      return this.optional(defaultValue) as any
    },
  }

  return schema
}
