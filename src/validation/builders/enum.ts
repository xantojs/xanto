import { picklist, safeParse } from 'valibot'

import { createInitialState, createOptionalMethods } from '../core/state.js'
import { createStandardSchema, toStandardResult } from '../core/standard.js'

import type { ChainState } from '../types/chainState.types.js'
import type { XantoEnumSchema } from '../types/chain.types.js'

function build<const T extends readonly string[]>(options: T, state: ChainState<T[number]>): XantoEnumSchema<T> {
  const valibotSchema = picklist(options as unknown as readonly [string, ...string[]], state.message)

  function validate(value: unknown) {
    if (value === undefined && state.isOptional) {
      return { value: state.defaultValue as T[number] }
    }
    return toStandardResult(safeParse(valibotSchema, value))
  }

  return {
    options,
    ...createStandardSchema<T[number], T[number]>(validate),
    ...createOptionalMethods(state, (newState) => build(options, newState)),
  }
}

export function enumType<const T extends readonly string[]>(options: T, message?: string): XantoEnumSchema<T> {
  return build(options, createInitialState(message))
}
