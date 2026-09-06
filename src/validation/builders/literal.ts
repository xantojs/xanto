import { literal as vLiteral, safeParse } from 'valibot'

import { createInitialState, createOptionalMethods, handleOptional } from '../core/state.js'
import { createStandardSchema, toStandardResult } from '../core/standard.js'

import type { ChainState } from '../types/chainState.types.js'
import type { XantoLiteralSchema } from '../types/chain.types.js'

function build<const T extends string | number | boolean>(expectedValue: T, state: ChainState<T>): XantoLiteralSchema<T> {
  const valibotSchema = vLiteral(expectedValue, state.message)

  const validate = handleOptional<T>(state, (value) => toStandardResult(safeParse(valibotSchema, value)))

  return {
    literalValue: expectedValue,
    ...createStandardSchema<T, T>(validate),
    ...createOptionalMethods(state, (newState) => build(expectedValue, newState)),
  }
}

export function literal<const T extends string | number | boolean>(expectedValue: T, message?: string): XantoLiteralSchema<T> {
  return build(expectedValue, createInitialState(message))
}
