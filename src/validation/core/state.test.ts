import { describe, it, expect } from 'vitest'
import { createInitialState, handleOptional, withAction, createOptionalMethods } from './state.js'
import { minLength } from 'valibot'

describe('validation/core/state', () => {
  it('createInitialState creates state with defaults', () => {
    const state = createInitialState('Custom error')
    expect(state).toEqual({
      actions: [],
      isOptional: false,
      defaultValue: undefined,
      message: 'Custom error',
    })
  })

  it('handleOptional bypasses validation when undefined and optional', async () => {
    let called = false
    const validate = (val: unknown) => {
      called = true
      return { value: val as string }
    }

    const handler = handleOptional({ isOptional: true, defaultValue: 'fallback' }, validate)
    const resOptional = await handler(undefined)
    expect(resOptional).toEqual({ value: 'fallback' })
    expect(called).toBe(false)

    const resProvided = await handler('actual')
    expect(resProvided).toEqual({ value: 'actual' })
    expect(called).toBe(true)
  })

  it('handleOptional executes validation when undefined but not optional', async () => {
    const validate = (_val: unknown) => ({ issues: [{ message: 'Required' }] })
    const handler = handleOptional({ isOptional: false, defaultValue: undefined }, validate)
    const res = await handler(undefined)
    expect(res).toEqual({ issues: [{ message: 'Required' }] })
  })

  it('withAction appends action to state', () => {
    const state = createInitialState<string>()
    const action = minLength(5) as unknown as import('valibot').PipeAction<string, string, import('valibot').BaseIssue<string>>
    const nextState = withAction(state, action)
    expect(nextState.actions).toHaveLength(1)
    expect(nextState.actions[0]).toBe(action)
  })

  it('createOptionalMethods produces optional and default variants', () => {
    const state = createInitialState<string>()
    const methods = createOptionalMethods(state, (s) => s)

    const optionalState = methods.optional()
    expect(optionalState.isOptional).toBe(true)
    expect(optionalState.defaultValue).toBeUndefined()

    const defaultState = methods.default('def')
    expect(defaultState.isOptional).toBe(true)
    expect(defaultState.defaultValue).toBe('def')
  })
})
