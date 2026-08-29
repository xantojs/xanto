import { createInitialState, createOptionalMethods, createStandardSchema } from '../utils/chain.util.js'

import type { ChainState } from '../types/chainState.type.js'
import type { XantoSchema } from '../types/chain.types.js'

function buildAny(state: ChainState<any>): XantoSchema<any, any> {
  function validate(value: unknown) {
    if (value === undefined && state.isOptional) {
      return { value: state.defaultValue }
    }
    return { value }
  }

  return {
    ...createStandardSchema<any, any>(validate),
    ...createOptionalMethods(state, buildAny),
  }
}

function buildUnknown(state: ChainState<unknown>): XantoSchema<unknown, unknown> {
  function validate(value: unknown) {
    if (value === undefined && state.isOptional) {
      return { value: state.defaultValue }
    }
    return { value }
  }

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
