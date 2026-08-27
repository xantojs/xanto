import { describe, it, expect } from 'vitest'
import { t } from '../index.js'

describe('t.boolean() with chaining', () => {
  it('should validate boolean values', () => {
    const schema = t.boolean()
    expect(schema['~standard'].validate(true)).toEqual({ value: true })
    expect(schema['~standard'].validate(false)).toEqual({ value: false })
  })

  it('should reject non-boolean values', () => {
    const schema = t.boolean()
    expect('issues' in schema['~standard'].validate('true')).toBe(true)
    expect('issues' in schema['~standard'].validate(1)).toBe(true)
    expect('issues' in schema['~standard'].validate(null)).toBe(true)
  })

  it('should chain coerce', () => {
    const schema = t.boolean().coerce()
    expect(schema['~standard'].validate('true')).toEqual({ value: true })
    expect(schema['~standard'].validate('1')).toEqual({ value: true })
    expect(schema['~standard'].validate(1)).toEqual({ value: true })
    expect(schema['~standard'].validate('false')).toEqual({ value: false })
    expect(schema['~standard'].validate('0')).toEqual({ value: false })
    expect(schema['~standard'].validate(0)).toEqual({ value: false })
    expect('issues' in schema['~standard'].validate('invalid')).toBe(true)
  })

  it('should chain default value', () => {
    const schema = t.boolean().default(true)
    expect(schema['~standard'].validate(undefined)).toEqual({ value: true })
    expect(schema['~standard'].validate(false)).toEqual({ value: false })
  })
})
