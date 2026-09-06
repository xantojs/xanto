import { describe, it, expect } from 'vitest'
import { XantoStateManager } from './stateManager.js'

describe('XantoStateManager', () => {
  it('set / get returns the stored value', () => {
    const state = new XantoStateManager<{ count: number }>()
    state.set('count', 42)
    expect(state.get('count')).toBe(42)
  })

  it('get returns undefined for a missing key', () => {
    const state = new XantoStateManager<{ count: number }>()
    expect(state.get('count')).toBeUndefined()
  })

  it('get<T> generic overload works for untyped keys', () => {
    const state = new XantoStateManager<Record<string, unknown>>()
    state.set('token', 'abc123')
    expect(state.get<string>('token')).toBe('abc123')
  })

  it('has returns true after set, false before', () => {
    const state = new XantoStateManager<{ x: number }>()
    expect(state.has('x')).toBe(false)
    state.set('x', 1)
    expect(state.has('x')).toBe(true)
  })

  it('delete removes the key', () => {
    const state = new XantoStateManager<{ x: number }>()
    state.set('x', 99)
    state.delete('x')
    expect(state.has('x')).toBe(false)
    expect(state.get('x')).toBeUndefined()
  })

  it('entries returns a frozen snapshot of the current store', () => {
    const state = new XantoStateManager<{ a: string; b: number }>()
    state.set('a', 'hello')
    state.set('b', 7)
    const entries = state.entries
    expect(entries).toEqual({ a: 'hello', b: 7 })
    expect(Object.isFrozen(entries)).toBe(true)
  })

  it('entries snapshot does not reflect later mutations', () => {
    const state = new XantoStateManager<{ a: string }>()
    state.set('a', 'before')
    const snapshot = state.entries
    state.set('a', 'after')
    // snapshot is frozen at the time of access, a new call returns the new value
    expect(snapshot.a).toBe('before')
    expect(state.entries.a).toBe('after')
  })

  it('multiple instances are isolated', () => {
    const a = new XantoStateManager<{ x: number }>()
    const b = new XantoStateManager<{ x: number }>()
    a.set('x', 1)
    b.set('x', 2)
    expect(a.get('x')).toBe(1)
    expect(b.get('x')).toBe(2)
  })
})
