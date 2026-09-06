import { number as vNumber, minValue, maxValue, integer as vInteger, safeParse, type PipeAction, type BaseIssue } from 'valibot'

import { createInitialState, createOptionalMethods, withAction } from '../core/state.js'
import { createStandardSchema, toStandardResult } from '../core/standard.js'
import { resolveValibotSchema } from '../core/coerce.js'

import type { CoercibleChainState } from '../types/chainState.types.js'
import type { XantoNumberSchema } from '../types/chain.types.js'

function coerceToNumber(val: unknown): unknown {
  if (typeof val === 'string' && val.trim() !== '') {
    const num = Number(val)
    return isNaN(num) ? val : num
  }
  return val
}

type NumberAction = PipeAction<number, number, BaseIssue<number>>

function build(state: CoercibleChainState<number>): XantoNumberSchema {
  function validate(value: unknown) {
    if (value === undefined && state.isOptional) {
      return { value: state.defaultValue as number }
    }

    const valibotSchema = resolveValibotSchema(vNumber, state, coerceToNumber)
    return toStandardResult(safeParse(valibotSchema, value))
  }

  const chain = (action: NumberAction) => build(withAction(state, action))

  return {
    ...createStandardSchema<number, number>(validate),

    min: (val, msg) => chain(minValue(val, msg)),
    max: (val, msg) => chain(maxValue(val, msg)),
    integer: (msg) => chain(vInteger(msg)),

    coerce: () => build({ ...state, isCoerce: true }),

    ...createOptionalMethods(state, build),
  }
}

export function number(message?: string): XantoNumberSchema {
  return build(createInitialState(message))
}
