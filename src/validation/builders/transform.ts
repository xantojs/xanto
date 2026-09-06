import { createInitialState, createOptionalMethods, handleOptional } from '../core/state.js'
import { createStandardSchema } from '../core/standard.js'

import type { StandardSchemaV1, InferInput, InferOutput } from '../../types/schema.types.js'
import type { ChainState } from '../types/chainState.types.js'
import type { XantoTransformSchema } from '../types/chain.types.js'

function build<T extends StandardSchemaV1, TOutput>(
  schema: T,
  fn: (value: InferOutput<T>) => TOutput,
  state: ChainState<TOutput>
): XantoTransformSchema<T, TOutput> {
  const validate = handleOptional<TOutput>(state, async (value) => {
    const result = await schema['~standard'].validate(value)
    if ('issues' in result && result.issues) {
      return { issues: result.issues }
    }
    return { value: fn(result.value as InferOutput<T>) }
  })

  return {
    ...createStandardSchema<InferInput<T>, TOutput>(validate),
    ...createOptionalMethods(state, (newState) => build(schema, fn, newState)),
  }
}

export function transform<T extends StandardSchemaV1, TOutput>(
  schema: T,
  fn: (value: InferOutput<T>) => TOutput
): XantoTransformSchema<T, TOutput> {
  return build(schema, fn, createInitialState<TOutput>())
}