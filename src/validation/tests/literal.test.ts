import { describe, it, expect } from 'vitest'
import { t } from '../index.js'

describe('t.literal() with chaining', () => {
  it('should validate exact string literal', () => {
    const schema = t.literal('active')
    expect(schema['~standard'].validate('active')).toEqual({ value: 'active' })
    expect('issues' in schema['~standard'].validate('inactive')).toBe(true)
  })

  it('should validate exact number literal', () => {
    const schema = t.literal(200)
    expect(schema['~standard'].validate(200)).toEqual({ value: 200 })
    expect('issues' in schema['~standard'].validate(404)).toBe(true)
  })

  it('should validate exact boolean literal', () => {
    const schema = t.literal(true)
    expect(schema['~standard'].validate(true)).toEqual({ value: true })
    expect('issues' in schema['~standard'].validate(false)).toBe(true)
  })
})
