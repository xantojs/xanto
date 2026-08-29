import type { PipeAction } from 'valibot'
import type { StandardIssue, StandardResult } from '../../types/schema.types.js'
import type { XantoSchema } from '../types/chain.types.js'
import type { ChainState } from '../types/chainState.type.js'

export function createInitialState<Output>(message?: string): ChainState<Output> {
  return { actions: [], isOptional: false, defaultValue: undefined, message }
}

export function withAction<Output>(state: ChainState<Output>, action: PipeAction<any, any, any>): ChainState<Output> {
  return { ...state, actions: [...state.actions, action] }
}

export function createOptionalMethods<Output>(state: ChainState<Output>, factory: (state: ChainState<any>) => any) {
  return {
    optional<DefaultValue = undefined>(defaultValue?: DefaultValue) {
      return factory({ ...state, isOptional: true, defaultValue }) as any
    },
    default<DefaultValue>(defaultValue: DefaultValue) {
      return factory({ ...state, isOptional: true, defaultValue }) as any
    },
  }
}

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
