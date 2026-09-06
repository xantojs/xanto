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
  type BaseIssue,
  type BaseSchema,
} from 'valibot'

import { createInitialState, createOptionalMethods, withAction } from '../core/state.js'
import { createStandardSchema, toStandardResult } from '../core/standard.js'

import type { ChainState } from '../types/chainState.types.js'
import type { XantoStringSchema } from '../types/chain.types.js'

const buildPipe = pipe as unknown as (...parts: unknown[]) => BaseSchema<unknown, unknown, BaseIssue<unknown>>

type StringAction = PipeAction<string, string, BaseIssue<string>>

function build(state: ChainState<string>): XantoStringSchema {
  const valibotSchema: BaseSchema<unknown, string, BaseIssue<unknown>> =
    state.actions.length > 0
      ? (buildPipe(vString(state.message), ...state.actions) as unknown as BaseSchema<unknown, string, BaseIssue<unknown>>)
      : (vString(state.message) as unknown as BaseSchema<unknown, string, BaseIssue<unknown>>)

  function validate(value: unknown) {
    if (value === undefined && state.isOptional) {
      return { value: state.defaultValue as string }
    }

    return toStandardResult(safeParse(valibotSchema, value))
  }

  const chain = (action: StringAction) => build(withAction(state, action))

  return {
    ...createStandardSchema<string, string>(validate),

    min: (len, msg) => chain(minLength(len, msg)),
    max: (len, msg) => chain(maxLength(len, msg)),
    length: (len, msg) => chain(vLength(len, msg)),
    email: (msg) => chain(vEmail(msg)),
    url: (msg) => chain(vUrl(msg)),
    uuid: (msg) => chain(vUuid(msg)),
    regex: (pattern, msg) => chain(vRegex(pattern, msg)),

    ...createOptionalMethods(state, build),
  }
}

export function string(message?: string): XantoStringSchema {
  return build(createInitialState(message))
}
