export interface StateManager<TState extends object = Record<string, unknown>> {
  get<K extends keyof TState>(key: K): TState[K]
  get<T = unknown>(key: string): T | undefined
  set<K extends keyof TState>(key: K, value: TState[K]): void
  has(key: keyof TState | string): boolean
  delete(key: keyof TState | string): void
  readonly entries: Readonly<Partial<TState>>
}