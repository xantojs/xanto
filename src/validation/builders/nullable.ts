import { createInitialState, createOptionalMethods, handleOptional } from '../core/state.js'
import { createStandardSchema } from '../core/standard.js'

import type { StandardSchemaV1, InferInput, InferOutput } from '../../types/schema.types.js'
import type { ChainState } from '../types/chainState.types.js'
import type { XantoNullableSchema } from '../types/chain.types.js'

function build<T extends StandardSchemaV1>(
  schema: T,
  state: ChainState<InferOutput<T> | null>
): XantoNullableSchema<T> {
  const validate = handleOptional<InferOutput<T> | null>(state, async (value) => {
    if (value === null) {
      return { value: null }
    }

    const result = await schema['~standard'].validate(value)
    if ('issues' in result && result.issues) {
      return { issues: result.issues }
    }
    return { value: result.value as InferOutput<T> }
  })

  return {
    schema,
    ...createStandardSchema<InferInput<T> | null, InferOutput<T> | null>(validate),
    ...createOptionalMethods(state, (newState) => build(schema, newState)),
  }
}

export function nullable<T extends StandardSchemaV1>(schema: T): XantoNullableSchema<T> {
  return build(schema, createInitialState<InferOutput<T> | null>())
}