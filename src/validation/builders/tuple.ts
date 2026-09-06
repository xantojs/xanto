import { createInitialState, createOptionalMethods, handleOptional } from '../core/state.js'
import { createStandardSchema } from '../core/standard.js'

import type { ChainState } from '../types/chainState.types.js'
import type { TupleShape, InferTupleInput, InferTupleOutput, XantoTupleSchema } from '../types/chain.types.js'

function build<T extends TupleShape>(items: T, state: ChainState<InferTupleOutput<T>>): XantoTupleSchema<T> {
  const validate = handleOptional<InferTupleOutput<T>>(state, async (value) => {
    if (!Array.isArray(value)) {
      return { issues: [{ message: 'Expected a tuple' }] }
    }
    if (value.length !== items.length) {
      return { issues: [{ message: `Expected exactly ${items.length} items` }] }
    }

    const output: unknown[] = []
    const issues: { message: string; path?: (string | number)[] }[] = []

    for (let i = 0; i < items.length; i++) {
      const itemResult = await items[i]!['~standard'].validate(value[i])
      if ('issues' in itemResult && itemResult.issues) {
        for (const issue of itemResult.issues) {
          issues.push({ message: issue.message, path: [i, ...((issue.path ?? []) as (string | number)[])] })
        }
      } else if ('value' in itemResult) {
        output[i] = itemResult.value
      }
    }

    if (issues.length > 0) {
      return { issues }
    }

    return { value: output as unknown as InferTupleOutput<T> }
  })

  return {
    items,
    ...createStandardSchema<InferTupleInput<T>, InferTupleOutput<T>>(validate),
    ...createOptionalMethods(state, (newState) => build(items, newState)),
  }
}

export function tuple<T extends TupleShape>(items: T): XantoTupleSchema<T> {
  return build(items, createInitialState<InferTupleOutput<T>>())
}