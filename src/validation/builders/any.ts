import { createInitialState, createOptionalMethods, handleOptional } from '../core/state.js'
import { createStandardSchema } from '../core/standard.js'

import type { ChainState } from '../types/chainState.types.js'
import type { XantoSchema } from '../types/chain.types.js'

function buildAny(state: ChainState<any>): XantoSchema<any, any> {
  const validate = handleOptional<unknown>(state, (value) => ({ value }))

  return {
    ...createStandardSchema<any, any>(validate),
    ...createOptionalMethods(state, buildAny),
  }
}

function buildUnknown(state: ChainState<unknown>): XantoSchema<unknown, unknown> {
  const validate = handleOptional<unknown>(state, (value) => ({ value }))

  return {
    ...createStandardSchema<unknown, unknown>(validate),
    ...createOptionalMethods(state, buildUnknown),
  }
}

export function any(): XantoSchema<any, any> {
  return buildAny(createInitialState())
}

export function unknown(): XantoSchema<unknown, unknown> {
  return buildUnknown(createInitialState())
}
