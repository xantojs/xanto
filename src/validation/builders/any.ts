import { createInitialState, createOptionalMethods } from '../utils/chain.util.js'

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
    '~standard': {
      version: 1,
      vendor: 'xanto',
      validate,
      types: {
        input: undefined as unknown as any,
        output: undefined as unknown as any,
      },
    },

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
    '~standard': {
      version: 1,
      vendor: 'xanto',
      validate,
      types: {
        input: undefined as unknown as unknown,
        output: undefined as unknown as unknown,
      },
    },

    ...createOptionalMethods(state, buildUnknown),
  }
}

export function any(): XantoSchema<any, any> {
  return buildAny(createInitialState())
}

export function unknown(): XantoSchema<unknown, unknown> {
  return buildUnknown(createInitialState())
}
