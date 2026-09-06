import { describe, it, expect } from 'vitest'
import { resolveValibotSchema } from './coerce.js'
import { createInitialState, withAction } from './state.js'
import { string as vString, minLength } from 'valibot'

describe('validation/core/coerce', () => {
  it('resolveValibotSchema creates base schema without actions', () => {
    const state = createInitialState<string>()
    const schema = resolveValibotSchema(vString, { ...state, isCoerce: false })
    expect(schema).toBeDefined()
  })

  it('resolveValibotSchema pipes actions', () => {
    const state = createInitialState<string>()
    const action = minLength(3) as unknown as import('valibot').PipeAction<string, string, import('valibot').BaseIssue<string>>
    const withAct = withAction(state, action)
    const schema = resolveValibotSchema(vString, { ...withAct, isCoerce: false })
    expect(schema).toBeDefined()
  })

  it('resolveValibotSchema applies coerceFn transform', () => {
    const state = createInitialState<string>()
    const schema = resolveValibotSchema(vString, { ...state, isCoerce: true }, (v) => String(v))
    expect(schema).toBeDefined()
  })
})
