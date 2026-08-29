import type { PipeAction } from 'valibot'

export interface ChainState<Output> {
  readonly actions: readonly PipeAction<any, any, any>[]
  readonly isOptional: boolean
  readonly defaultValue: Output | undefined
  readonly message: string | undefined
}

export interface CoercibleChainState<Output> extends ChainState<Output> {
  isCoerce?: boolean
}
