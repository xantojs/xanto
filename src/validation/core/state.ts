import type { PipeAction, BaseIssue } from 'valibot'
import type { ChainState } from '../types/chainState.types.js'

export function createInitialState<TInput, TOutput = TInput>(message?: string): ChainState<TInput, TOutput> {
  return { actions: [], isOptional: false, defaultValue: undefined, message }
}

export function withAction<TInput, TOutput = TInput>(
  state: ChainState<TInput, TOutput>,
  action: PipeAction<TInput, TOutput, BaseIssue<TInput>>
): ChainState<TInput, TOutput> {
  return { ...state, actions: [...state.actions, action] }
}

export function createOptionalMethods<TInput, TOutput, TSchema>(
  state: ChainState<TInput, TOutput>,
  factory: (state: ChainState<TInput, TOutput>) => TSchema
): {
  optional(defaultValue?: unknown): TSchema
  default(defaultValue: unknown): TSchema
} {
  return {
    optional(defaultValue) {
      return factory({ ...state, isOptional: true, defaultValue })
    },
    default(defaultValue) {
      return factory({ ...state, isOptional: true, defaultValue })
    },
  }
}
