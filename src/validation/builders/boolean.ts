import { boolean as vBoolean, safeParse } from 'valibot'

import { createInitialState, createOptionalMethods, handleOptional } from '../core/state.js'
import { createStandardSchema, toStandardResult } from '../core/standard.js'
import { resolveValibotSchema } from '../core/coerce.js'

import type { CoercibleChainState } from '../types/chainState.types.js'
import type { XantoBooleanSchema } from '../types/chain.types.js'

function coerceToBoolean(val: unknown): unknown {
  if (val === 'true' || val === '1' || val === 1) return true
  if (val === 'false' || val === '0' || val === 0) return false
  return val
}

function build(state: CoercibleChainState<boolean>): XantoBooleanSchema {
  const valibotSchema = resolveValibotSchema(vBoolean, state, coerceToBoolean)

  const validate = handleOptional<boolean>(state, (value) => toStandardResult(safeParse(valibotSchema, value)))

  return {
    ...createStandardSchema<boolean, boolean>(validate),

    coerce: () => build({ ...state, isCoerce: true }),

    ...createOptionalMethods(state, build),
  }
}

export function boolean(message?: string): XantoBooleanSchema {
  return build(createInitialState(message))
}
