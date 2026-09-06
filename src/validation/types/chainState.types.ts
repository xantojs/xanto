import type { PipeAction, BaseIssue } from 'valibot'

export interface ChainState<TInput, TOutput = TInput> {
  readonly actions: readonly PipeAction<TInput, TOutput, BaseIssue<TInput>>[]
  readonly isOptional: boolean
  readonly defaultValue: unknown
  readonly message: string | undefined
}

export interface CoercibleChainState<TOutput, TInput = TOutput> extends ChainState<TInput, TOutput> {
  isCoerce?: boolean
}
