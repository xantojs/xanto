import { describe, it, expect } from 'vitest'
import { t } from '../index.js'

describe('t.nullable()', () => {
  const schema = t.nullable(t.string())

  it('should accept null', async () => {
    expect(await schema['~standard'].validate(null)).toEqual({ value: null })
  })

  it('should validate underlying schema for non-null values', async () => {
    expect(await schema['~standard'].validate('hello')).toEqual({ value: 'hello' })
    expect('issues' in (await schema['~standard'].validate(42))).toBe(true)
  })

  it('should support optional/default chaining', async () => {
    const opt = t.nullable(t.string()).optional()
    expect(await opt['~standard'].validate(undefined)).toEqual({ value: undefined })

    const withDefault = t.nullable(t.string()).default('fallback')
    expect(await withDefault['~standard'].validate(undefined)).toEqual({ value: 'fallback' })
  })
})