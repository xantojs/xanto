import { createInitialState, createOptionalMethods } from '../core/state.js'
import { createStandardSchema } from '../core/standard.js'

import type { StandardSchemaV1, StandardResult, InferInput, InferOutput } from '../../types/schema.types.js'
import type { ChainState } from '../types/chainState.types.js'
import type { XantoArraySchema } from '../types/chain.types.js'

interface ArrayChainState<T> extends ChainState<T[]> {
  minLength?: number
  maxLength?: number
  exactLength?: number
}

function build<ItemSchema extends StandardSchemaV1<any, any>>(
  itemSchema: ItemSchema,
  state: ArrayChainState<InferOutput<ItemSchema>>
): XantoArraySchema<InferInput<ItemSchema>, InferOutput<ItemSchema>> {
  type Input = InferInput<ItemSchema>[]
  type Output = InferOutput<ItemSchema>[]

  async function validate(value: unknown): Promise<StandardResult<Output>> {
    if (value === undefined && state.isOptional) {
      return { value: state.defaultValue as Output }
    }

    if (!Array.isArray(value)) {
      return {
        issues: [{ message: state.message ?? 'Expected array' }],
      }
    }

    if (state.minLength !== undefined && value.length < state.minLength) {
      return {
        issues: [{ message: state.message ?? `Array must contain at least ${state.minLength} items` }],
      }
    }

    if (state.maxLength !== undefined && value.length > state.maxLength) {
      return {
        issues: [{ message: state.message ?? `Array must contain at most ${state.maxLength} items` }],
      }
    }

    if (state.exactLength !== undefined && value.length !== state.exactLength) {
      return {
        issues: [{ message: state.message ?? `Array must contain exactly ${state.exactLength} items` }],
      }
    }

    const outputs: Output = []
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

  return {
    ...createStandardSchema<Input, Output>(validate),

    min: (len) => build(itemSchema, { ...state, minLength: len }),
    max: (len) => build(itemSchema, { ...state, maxLength: len }),
    length: (len) => build(itemSchema, { ...state, exactLength: len }),

    ...createOptionalMethods(state, (newState) => build(itemSchema, newState)),
  }
}

export function array<ItemSchema extends StandardSchemaV1<any, any>>(
  itemSchema: ItemSchema,
  message?: string
): XantoArraySchema<InferInput<ItemSchema>, InferOutput<ItemSchema>> {
  return build(itemSchema, createInitialState(message))
}
