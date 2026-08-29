import type { StandardIssue, StandardResult } from '../../types/schema.types.js'

export function toStandardResult<Output>(
  result:
    | { success: true; output: Output }
    | { success: false; issues: readonly { message: string; path?: readonly { key: unknown }[] | undefined }[] }
): StandardResult<Output> {
  if (result.success) {
    return { value: result.output }
  }
  return {
    issues: result.issues.map(
      (issue): StandardIssue => ({
        message: issue.message,
        path: issue.path?.map((item) => item.key as string | number),
      })
    ),
  }
}

export function createStandardSchema<Input, Output>(
  validateFn: (value: unknown) => StandardResult<Output> | Promise<StandardResult<Output>>
) {
  return {
    '~standard': {
      version: 1 as const,
      vendor: 'xanto',
      validate: validateFn,
      types: {
        input: undefined as unknown as Input,
        output: undefined as unknown as Output,
      },
    },
  }
}
