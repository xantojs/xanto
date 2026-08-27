import { describe, it, expect } from 'vitest'
import { t } from './index.js'

describe('t.string()', () => {
  it('should validate valid string', () => {
    const schema = t.string()
    const result = schema['~standard'].validate('hello')
    expect(result).toEqual({ value: 'hello' })
  })

  it('should reject non-string', () => {
    const schema = t.string()
    const result = schema['~standard'].validate(123)
    expect('issues' in result && result.issues).toBeTruthy()
  })

  it('should validate min and max length', () => {
    const schema = t.string({ min: 3, max: 5 })
    expect(schema['~standard'].validate('abc')).toEqual({ value: 'abc' })
    
    const tooShort = schema['~standard'].validate('ab')
    expect('issues' in tooShort).toBe(true)

    const tooLong = schema['~standard'].validate('abcdef')
    expect('issues' in tooLong).toBe(true)
  })

  it('should validate email', () => {
    const schema = t.string({ email: true })
    expect(schema['~standard'].validate('test@example.com')).toEqual({ value: 'test@example.com' })

    const invalid = schema['~standard'].validate('not-an-email')
    expect('issues' in invalid).toBe(true)
  })
})

describe('t.number()', () => {
  it('should validate valid number', () => {
    const schema = t.number()
    const result = schema['~standard'].validate(42)
    expect(result).toEqual({ value: 42 })
  })

  it('should validate min and max value', () => {
    const schema = t.number({ min: 10, max: 20 })
    expect(schema['~standard'].validate(15)).toEqual({ value: 15 })

    const tooSmall = schema['~standard'].validate(5)
    expect('issues' in tooSmall).toBe(true)

    const tooLarge = schema['~standard'].validate(25)
    expect('issues' in tooLarge).toBe(true)
  })

  it('should support integer option', () => {
    const schema = t.number({ integer: true })
    expect(schema['~standard'].validate(10)).toEqual({ value: 10 })

    const float = schema['~standard'].validate(10.5)
    expect('issues' in float).toBe(true)
  })
})
