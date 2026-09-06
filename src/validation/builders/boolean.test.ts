import { describe, it, expect } from 'vitest'
import { x } from '../index.js'

describe('x.boolean()', () => {
  it('should validate strict boolean values', () => {
    const schema = x.boolean()
    expect(schema['~standard'].validate(true)).toEqual({ value: true })
    expect(schema['~standard'].validate(false)).toEqual({ value: false })
  })

  it('should reject non-boolean values in strict mode', () => {
    const schema = x.boolean()
    expect('issues' in schema['~standard'].validate('true')).toBe(true)
    expect('issues' in schema['~standard'].validate(1)).toBe(true)
    expect('issues' in schema['~standard'].validate(null)).toBe(true)
    expect('issues' in schema['~standard'].validate(undefined)).toBe(true)
  })

  it('should coerce string and numeric truthy/falsy values', () => {
    const schema = x.boolean().coerce()

    expect(schema['~standard'].validate('true')).toEqual({ value: true })
    expect(schema['~standard'].validate('1')).toEqual({ value: true })
    expect(schema['~standard'].validate(1)).toEqual({ value: true })

    expect(schema['~standard'].validate('false')).toEqual({ value: false })
    expect(schema['~standard'].validate('0')).toEqual({ value: false })
    expect(schema['~standard'].validate(0)).toEqual({ value: false })

    expect('issues' in schema['~standard'].validate('invalid')).toBe(true)
    expect('issues' in schema['~standard'].validate(123)).toBe(true)
  })

  it('should handle optional and default values correctly', () => {
    const optionalSchema = x.boolean().optional()
    expect(optionalSchema['~standard'].validate(undefined)).toEqual({ value: undefined })
    expect(optionalSchema['~standard'].validate(true)).toEqual({ value: true })

    const defaultSchema = x.boolean().default(true)
    expect(defaultSchema['~standard'].validate(undefined)).toEqual({ value: true })
    expect(defaultSchema['~standard'].validate(false)).toEqual({ value: false })
  })

  it('should maintain immutability on chaining', () => {
    const base = x.boolean()
    const coerced = base.coerce()

    expect('issues' in base['~standard'].validate('true')).toBe(true)
    expect(coerced['~standard'].validate('true')).toEqual({ value: true })
  })

  it('should support custom error messages', () => {
    const schema = x.boolean('Must be a boolean')
    const result = schema['~standard'].validate('not-a-boolean')

    expect('issues' in result && result.issues).toBeTruthy()
    if ('issues' in result && result.issues) {
      expect(result.issues[0]?.message).toBe('Must be a boolean')
    }
  })
})
