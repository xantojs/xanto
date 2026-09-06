import { pipe, transform, unknown as vUnknown } from 'valibot'
import type { BaseSchema, BaseIssue } from 'valibot'

import type { CoercibleChainState } from '../types/chainState.types.js'

const buildPipe = pipe as unknown as (...parts: unknown[]) => BaseSchema<unknown, unknown, BaseIssue<unknown>>

export function resolveValibotSchema<Output>(
  baseFactory: (message?: string) => BaseSchema<unknown, Output, BaseIssue<unknown>>,
  state: CoercibleChainState<Output>,
  coerceFn?: (value: unknown) => unknown
): BaseSchema<unknown, Output, BaseIssue<unknown>> {
  if (state.isCoerce && coerceFn) {
    return buildPipe(vUnknown(), transform(coerceFn), baseFactory(state.message), ...state.actions) as unknown as BaseSchema<
      unknown,
      Output,
      BaseIssue<unknown>
    >
  }
  if (state.actions.length > 0) {
    return buildPipe(baseFactory(state.message), ...state.actions) as unknown as BaseSchema<unknown, Output, BaseIssue<unknown>>
  }
  return baseFactory(state.message)
}
