import type { StateManager } from '../types/stateManager.types.js'

export class XantoStateManager<TState extends Record<string, unknown>> implements StateManager<TState> {
  private store = new Map<keyof TState, unknown>()

  get<K extends keyof TState>(key: K): TState[K]
  get<T = unknown>(key: string): T | undefined {
    return this.store.get(key as keyof TState) as T
  }

  set<K extends keyof TState>(key: K, value: TState[K]): void {
    this.store.set(key, value)
  }

  has(key: keyof TState | string): boolean {
    return this.store.has(key as keyof TState)
  }

  delete(key: keyof TState | string): void {
    this.store.delete(key as keyof TState)
  }

  get entries(): Readonly<Partial<TState>> {
    return Object.freeze(Object.fromEntries(this.store.entries())) as Readonly<Partial<TState>>
  }
}

declare module 'h3' {
  interface H3EventContext {
    __xantoState?: XantoStateManager<Record<string, unknown>>
  }
}
