import type { PipeAction } from 'valibot'
import type { ChainState } from '../types/chainState.types.js'

export function createInitialState<Output>(message?: string): ChainState<Output> {
  return { actions: [], isOptional: false, defaultValue: undefined, message }
}

export function withAction<Output>(state: ChainState<Output>, action: PipeAction<any, any, any>): ChainState<Output> {
  return { ...state, actions: [...state.actions, action] }
}

export function createOptionalMethods<Output>(state: ChainState<Output>, factory: (state: ChainState<any>) => any) {
  return {
    optional<DefaultValue = undefined>(defaultValue?: DefaultValue) {
      return factory({ ...state, isOptional: true, defaultValue }) as any
    },
    default<DefaultValue>(defaultValue: DefaultValue) {
      return factory({ ...state, isOptional: true, defaultValue }) as any
    },
  }
}
