import {
  number as vNumber,
  pipe,
  minValue,
  maxValue,
  integer as vInteger,
  transform,
  unknown as vUnknown,
  safeParse,
  type PipeAction,
} from 'valibot'

import {
  createInitialState,
  withAction,
  createOptionalMethods,
  createStandardSchema,
  toStandardResult,
} from '../utils/chain.util.js'

import type { ChainState } from '../types/chainState.type.js'
import type { XantoNumberSchema } from '../types/chain.types.js'

interface NumberChainState extends ChainState<number> {
  isCoerce?: boolean
}

function build(state: NumberChainState): XantoNumberSchema {
  function validate(value: unknown) {
    if (value === undefined && state.isOptional) {
      return { value: state.defaultValue as any }
    }

    let valibotSchema: any

    if (state.isCoerce) {
      valibotSchema = (pipe as any)(
        vUnknown(),
        transform((val: unknown) => {
          if (typeof val === 'string' && val.trim() !== '') {
            const num = Number(val)
            return isNaN(num) ? val : num
          }
          return val
        }),
        vNumber(state.message),
        ...state.actions
      )
    } else {
      valibotSchema = state.actions.length > 0 ? (pipe as any)(vNumber(state.message), ...state.actions) : vNumber(state.message)
    }

    return toStandardResult(safeParse(valibotSchema, value))
  }

  const chain = (action: PipeAction<any, any, any>) => build(withAction(state, action))

  return {
    ...createStandardSchema<number, number>(validate),

    min: (val, msg) => chain(minValue(val, msg)) as any,
    max: (val, msg) => chain(maxValue(val, msg)) as any,
    integer: (msg) => chain(vInteger(msg)) as any,

    coerce: () => build({ ...state, isCoerce: true }),

    ...createOptionalMethods(state, build),
  }
}

export function number(message?: string): XantoNumberSchema {
  return build(createInitialState(message))
}
