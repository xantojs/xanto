import {
  string as vString,
  pipe,
  minLength,
  maxLength,
  length as vLength,
  email as vEmail,
  url as vUrl,
  uuid as vUuid,
  regex as vRegex,
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
import type { XantoStringSchema } from '../types/chain.types.js'

function build(state: ChainState<string>): XantoStringSchema {
  function validate(value: unknown) {
    if (value === undefined && state.isOptional) {
      return { value: state.defaultValue as any }
    }
    const valibotSchema =
      state.actions.length > 0 ? (pipe as any)(vString(state.message), ...state.actions) : vString(state.message)
    return toStandardResult(safeParse(valibotSchema, value))
  }

  const chain = (action: PipeAction<any, any, any>) => build(withAction(state, action))

  return {
    ...createStandardSchema<string, string>(validate),

    min: (len, msg) => chain(minLength(len, msg)) as any,
    max: (len, msg) => chain(maxLength(len, msg)) as any,
    length: (len, msg) => chain(vLength(len, msg)) as any,
    email: (msg) => chain(vEmail(msg)) as any,
    url: (msg) => chain(vUrl(msg)) as any,
    uuid: (msg) => chain(vUuid(msg)) as any,
    regex: (pattern, msg) => chain(vRegex(pattern, msg)) as any,

    ...createOptionalMethods(state, build),
  }
}

export function string(message?: string): XantoStringSchema {
  return build(createInitialState(message))
}
