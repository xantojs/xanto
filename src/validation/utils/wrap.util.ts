import { type BaseSchema, type BaseIssue, safeParse } from 'valibot'
import type { StandardSchemaV1, StandardResult } from '../types/schema.type.js'

export function wrapSchema<Input, Output>(
  schema: BaseSchema<Input, Output, BaseIssue<unknown>>
): StandardSchemaV1<Input, Output> {
  return {
    '~standard': {
      version: 1,
      vendor: 'xanto',
      validate(value: unknown): StandardResult<Output> {
        const result = safeParse(schema, value)
        if (result.success) {
          return { value: result.output }
        }

        return {
          issues: result.issues.map((issue) => ({
            message: issue.message,
            path: issue.path?.map((item) => item.key as string | number),
          })),
        }
      },
      types: {
        input: undefined as unknown as Input,
        output: undefined as unknown as Output,
      },
    },
  }
}
