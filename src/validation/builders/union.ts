import { createInitialState, createOptionalMethods } from '../core/state.js'
import { createStandardSchema } from '../core/standard.js'

import type { StandardSchemaV1, StandardIssue } from '../../types/schema.types.js'
import type { ChainState } from '../types/chainState.types.js'
import type { XantoUnionSchema, InferUnionInput, InferUnionOutput } from '../types/chain.types.js'

function build<const T extends readonly StandardSchemaV1<any, any>[]>(
  options: T,
  state: ChainState<InferUnionOutput<T>>
): XantoUnionSchema<T> {
  async function validate(value: unknown) {
    if (value === undefined && state.isOptional) {
      return { value: state.defaultValue as any }
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
          message: state.message ?? 'Value does not match any union schema option',
        },
      ],
    }
  }

  return {
    options,
    ...createStandardSchema<InferUnionInput<T>, InferUnionOutput<T>>(validate),

    ...createOptionalMethods(state, (newState) => build(options, newState)),
  }
}

export function union<const T extends readonly StandardSchemaV1<any, any>[]>(options: T, message?: string): XantoUnionSchema<T> {
  return build(options, createInitialState(message))
}
