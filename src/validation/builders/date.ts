import { date as vDate, pipe, minValue, maxValue, transform, unknown as vUnknown, safeParse, type PipeAction } from 'valibot'

import {
  createInitialState,
  withAction,
  createOptionalMethods,
  createStandardSchema,
  toStandardResult,
} from '../utils/chain.util.js'

import type { ChainState } from '../types/chainState.type.js'
import type { XantoDateSchema } from '../types/chain.types.js'

interface DateChainState extends ChainState<Date> {
  isCoerce?: boolean
}

function build(state: DateChainState): XantoDateSchema {
  function validate(value: unknown) {
    if (value === undefined && state.isOptional) {
      return { value: state.defaultValue as any }
    }

    let valibotSchema: any

    if (state.isCoerce) {
      valibotSchema = (pipe as any)(
        vUnknown(),
        transform((val: unknown) => {
          if (typeof val === 'string' || typeof val === 'number') {
            const parsed = new Date(val)
            return isNaN(parsed.getTime()) ? val : parsed
          }
          return val
        }),
        vDate(state.message),
        ...state.actions
      )
    } else {
      valibotSchema = state.actions.length > 0 ? (pipe as any)(vDate(state.message), ...state.actions) : vDate(state.message)
    }

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
