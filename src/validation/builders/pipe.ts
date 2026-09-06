import { createInitialState, createOptionalMethods, handleOptional } from '../core/state.js'
import { createStandardSchema } from '../core/standard.js'

import type { StandardSchemaV1, InferInput, InferOutput } from '../../types/schema.types.js'
import type { ChainState } from '../types/chainState.types.js'
import type { XantoSchema } from '../types/chain.types.js'

function build<A extends StandardSchemaV1, B extends StandardSchemaV1>(
  schemaA: A,
  schemaB: B,
  state: ChainState<InferOutput<B>>
): XantoSchema<InferInput<A>, InferOutput<B>> {
  const validate = handleOptional<InferOutput<B>>(state, async (value) => {
    const first = await schemaA['~standard'].validate(value)
    if ('issues' in first && first.issues) {
      return { issues: first.issues }
    }

    const second = await schemaB['~standard'].validate(first.value)
    if ('issues' in second && second.issues) {
      return { issues: second.issues }
    }

    return { value: second.value as InferOutput<B> }
  })

  return {
    ...createStandardSchema<InferInput<A>, InferOutput<B>>(validate),
    ...createOptionalMethods(state, (newState) => build(schemaA, schemaB, newState)),
  }
}

export function pipe<A extends StandardSchemaV1, B extends StandardSchemaV1>(
  schemaA: A,
  schemaB: B
): XantoSchema<InferInput<A>, InferOutput<B>> {
  return build(schemaA, schemaB, createInitialState<InferOutput<B>>())
}