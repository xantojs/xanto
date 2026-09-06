import { describe, it, expect } from 'vitest'
import { x } from '../index.js'

describe('x.nullable()', () => {
  const schema = x.nullable(x.string())

  it('should accept null', async () => {
    expect(await schema['~standard'].validate(null)).toEqual({ value: null })
  })

  it('should validate underlying schema for non-null values', async () => {
    expect(await schema['~standard'].validate('hello')).toEqual({ value: 'hello' })
    expect('issues' in (await schema['~standard'].validate(42))).toBe(true)
  })

  it('should support optional/default chaining', async () => {
    const opt = x.nullable(x.string()).optional()
    expect(await opt['~standard'].validate(undefined)).toEqual({ value: undefined })

    const withDefault = x.nullable(x.string()).default('fallback')
    expect(await withDefault['~standard'].validate(undefined)).toEqual({ value: 'fallback' })
  })
})
