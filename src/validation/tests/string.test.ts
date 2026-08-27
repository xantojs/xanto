import { describe, it, expect } from 'vitest'
import { t } from '../index.js'

describe('t.string() with chaining', () => {
  it('should validate basic string', () => {
    const schema = t.string()
    expect(schema['~standard'].validate('hello')).toEqual({ value: 'hello' })
    expect(schema['~standard'].validate('')).toEqual({ value: '' })
  })

  it('should reject non-string values', () => {
    const schema = t.string()
    expect('issues' in schema['~standard'].validate(123)).toBe(true)
    expect('issues' in schema['~standard'].validate(null)).toBe(true)
    expect('issues' in schema['~standard'].validate(undefined)).toBe(true)
  })

  it('should chain min and max length', () => {
    const schema = t.string().min(3).max(5)
    expect(schema['~standard'].validate('abc')).toEqual({ value: 'abc' })
    expect(schema['~standard'].validate('abcde')).toEqual({ value: 'abcde' })
    expect('issues' in schema['~standard'].validate('ab')).toBe(true)
    expect('issues' in schema['~standard'].validate('abcdef')).toBe(true)
  })

  it('should chain length', () => {
    const schema = t.string().length(4)
    expect(schema['~standard'].validate('test')).toEqual({ value: 'test' })
    expect('issues' in schema['~standard'].validate('abc')).toBe(true)
    expect('issues' in schema['~standard'].validate('abcde')).toBe(true)
  })

  it('should chain email format', () => {
    const schema = t.string().email()
    expect(schema['~standard'].validate('user@xanto.org')).toEqual({ value: 'user@xanto.org' })
    expect('issues' in schema['~standard'].validate('not-an-email')).toBe(true)
  })

  it('should chain url format', () => {
    const schema = t.string().url()
    expect(schema['~standard'].validate('https://xanto.js.org')).toEqual({ value: 'https://xanto.js.org' })
    expect('issues' in schema['~standard'].validate('invalid-url')).toBe(true)
  })

  it('should chain uuid format', () => {
    const schema = t.string().uuid()
    const validUuid = '123e4567-e89b-12d3-a456-426614174000'
    expect(schema['~standard'].validate(validUuid)).toEqual({ value: validUuid })
    expect('issues' in schema['~standard'].validate('not-a-uuid')).toBe(true)
  })

  it('should chain regex', () => {
    const schema = t.string().regex(/^[A-Z]{3}$/)
    expect(schema['~standard'].validate('ABC')).toEqual({ value: 'ABC' })
    expect('issues' in schema['~standard'].validate('abc')).toBe(true)
  })

  it('should chain optional and default', () => {
    const optionalSchema = t.string().optional()
    expect(optionalSchema['~standard'].validate(undefined)).toEqual({ value: undefined })
    expect(optionalSchema['~standard'].validate('hello')).toEqual({ value: 'hello' })

    const defaultSchema = t.string().default('guest')
    expect(defaultSchema['~standard'].validate(undefined)).toEqual({ value: 'guest' })
    expect(defaultSchema['~standard'].validate('alex')).toEqual({ value: 'alex' })
  })
})
