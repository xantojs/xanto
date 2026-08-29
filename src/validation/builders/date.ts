import { date as vDate, pipe, minValue, maxValue, transform, unknown as vUnknown, safeParse, type PipeAction } from 'valibot'

import { createInitialState, createOptionalMethods, withAction } from '../core/state.js'
import { createStandardSchema, toStandardResult } from '../core/standard.js'
import { resolveValibotSchema } from '../core/coerce.js'

import type { CoercibleChainState } from '../types/chainState.types.js'
import type { XantoDateSchema } from '../types/chain.types.js'

function coerceToDate(val: unknown): unknown {
  if (typeof val === 'string' || typeof val === 'number') {
    const parsed = new Date(val)
    return isNaN(parsed.getTime()) ? val : parsed
  }
  return val
}

function build(state: CoercibleChainState<Date>): XantoDateSchema {
  function validate(value: unknown) {
    if (value === undefined && state.isOptional) {
      return { value: state.defaultValue as any }
    }

    const valibotSchema = resolveValibotSchema(vDate, state, coerceToDate)
    return toStandardResult(safeParse(valibotSchema, value))
  }

  const chain = (action: PipeAction<any, any, any>) => build(withAction(state, action))

  return {
    ...createStandardSchema<Date | string, Date>(validate),

    min: (minDate, msg) => chain(minValue(minDate, msg)) as any,
    max: (maxDate, msg) => chain(maxValue(maxDate, msg)) as any,
    coerce: () => build({ ...state, isCoerce: true }) as any,

    ...createOptionalMethods(state, build),
  }
}

export function date(message?: string): XantoDateSchema {
  return build(createInitialState(message))
}
