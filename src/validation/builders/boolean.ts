import { boolean as vBoolean, pipe, transform, unknown as vUnknown, safeParse, type BaseSchema } from 'valibot'

import { createInitialState, createOptionalMethods, createStandardSchema, toStandardResult } from '../utils/chain.util.js'

import type { ChainState } from '../types/chainState.type.js'
import type { XantoBooleanSchema } from '../types/chain.types.js'

interface BooleanChainState extends ChainState<boolean> {
  isCoerce?: boolean
}

function build(state: BooleanChainState): XantoBooleanSchema {
  function validate(value: unknown) {
    if (value === undefined && state.isOptional) {
      return { value: state.defaultValue as any }
    }

    let valibotSchema: any

    if (state.isCoerce) {
      valibotSchema = (pipe as any)(
        vUnknown(),
        transform((val: unknown) => {
          if (val === 'true' || val === '1' || val === 1) return true
          if (val === 'false' || val === '0' || val === 0) return false
          return val
        }),
        vBoolean(state.message),
        ...state.actions
      )
    } else {
      valibotSchema =
        state.actions.length > 0 ? (pipe as any)(vBoolean(state.message), ...state.actions) : vBoolean(state.message)
    }

    return toStandardResult(safeParse(valibotSchema, value))
  }

  return {
    ...createStandardSchema<boolean, boolean>(validate),

    coerce: () => build({ ...state, isCoerce: true }),

    ...createOptionalMethods(state, build),
  }
}

export function boolean(message?: string): XantoBooleanSchema {
  return build(createInitialState(message))
}
