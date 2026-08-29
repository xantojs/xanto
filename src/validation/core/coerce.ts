import { pipe, transform, unknown as vUnknown } from 'valibot'
import type { BaseSchema, BaseIssue } from 'valibot'

import type { CoercibleChainState } from '../types/chainState.types.js'

export function resolveValibotSchema<Output>(
  baseFactory: (message?: string) => BaseSchema<any, Output, BaseIssue<unknown>>,
  state: CoercibleChainState<Output>,
  coerceFn?: (value: unknown) => unknown
): any {
  if (state.isCoerce && coerceFn) {
    return (pipe as any)(vUnknown(), transform(coerceFn), baseFactory(state.message), ...state.actions)
  }
  return state.actions.length > 0 ? (pipe as any)(baseFactory(state.message), ...state.actions) : baseFactory(state.message)
}
