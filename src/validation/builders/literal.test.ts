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

  it('should reject wrong type even if value looks similar', () => {
    const schema = t.literal('200')
    expect('issues' in schema['~standard'].validate(200)).toBe(true)
    expect(schema['~standard'].validate('200')).toEqual({ value: '200' })
  })

  it('should chain default value', () => {
    const schema = t.literal('active').default('active')
    expect(schema['~standard'].validate(undefined)).toEqual({ value: 'active' })
    expect(schema['~standard'].validate('active')).toEqual({ value: 'active' })
  })

  it('should chain optional without default', () => {
    const schema = t.literal('active').optional()
    expect(schema['~standard'].validate(undefined)).toEqual({ value: undefined })
    expect(schema['~standard'].validate('active')).toEqual({ value: 'active' })
  })

  it('should reject invalid values even when optional', () => {
    const schema = t.literal('active').optional()
    expect('issues' in schema['~standard'].validate('inactive')).toBe(true)
  })

  describe('immutability across branches', () => {
    it('should not affect base schema when calling optional() on it', () => {
      const base = t.literal('active')
      const optionalBranch = base.optional()

      expect('issues' in base['~standard'].validate(undefined)).toBe(true)
      expect(optionalBranch['~standard'].validate(undefined)).toEqual({ value: undefined })
    })

    it('should keep independent branches from the same base', () => {
      const base = t.literal(200)

      const branchA = base.optional()
      const branchB = base.default(200)

      expect(branchA['~standard'].validate(undefined)).toEqual({ value: undefined })
      expect(branchB['~standard'].validate(undefined)).toEqual({ value: 200 })
    })
  })

  describe('exposed literalValue', () => {
    it('should expose the original literal value', () => {
      const schema = t.literal('active')
      expect(schema.literalValue).toBe('active')
    })

    it('should preserve literalValue after chaining optional', () => {
      const schema = t.literal('active').optional()
      expect(schema.literalValue).toBe('active')
    })
  })

  describe('issues structure', () => {
    it('should return issues with message field on failure', () => {
      const schema = t.literal('active')
      const result = schema['~standard'].validate('inactive')

      expect('issues' in result).toBe(true)
      if ('issues' in result && result.issues) {
        expect(Array.isArray(result.issues)).toBe(true)
        expect(typeof result.issues[0]?.message).toBe('string')
      }
    })

    it('should use custom message on failure', () => {
      const schema = t.literal('active', 'Status must be active')
      const result = schema['~standard'].validate('inactive')

      expect('issues' in result).toBe(true)
      if ('issues' in result && result.issues) {
        expect(result.issues[0]?.message).toBe('Status must be active')
      }
    })
  })

  describe('edge cases', () => {
    it('should reject null and undefined by default', () => {
      const schema = t.literal('active')
      expect('issues' in schema['~standard'].validate(null)).toBe(true)
      expect('issues' in schema['~standard'].validate(undefined)).toBe(true)
    })

    it('should distinguish 0 from false', () => {
      const numberSchema = t.literal(0)
      expect('issues' in numberSchema['~standard'].validate(false)).toBe(true)
      expect(numberSchema['~standard'].validate(0)).toEqual({ value: 0 })
    })

    it('should distinguish empty string from other falsy values', () => {
      const schema = t.literal('')
      expect(schema['~standard'].validate('')).toEqual({ value: '' })
      expect('issues' in schema['~standard'].validate(0)).toBe(true)
      expect('issues' in schema['~standard'].validate(null)).toBe(true)
    })
  })
})
