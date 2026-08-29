import { describe, it, expect } from 'vitest'
import { t } from '../index.js'

describe('t.number() with chaining', () => {
  it('should validate basic number', () => {
    const schema = t.number()
    expect(schema['~standard'].validate(42)).toEqual({ value: 42 })
    expect(schema['~standard'].validate(0)).toEqual({ value: 0 })
    expect(schema['~standard'].validate(-10.5)).toEqual({ value: -10.5 })
  })

  it('should reject non-number values', () => {
    const schema = t.number()
    expect('issues' in schema['~standard'].validate('42')).toBe(true)
    expect('issues' in schema['~standard'].validate(NaN)).toBe(true)
    expect('issues' in schema['~standard'].validate(null)).toBe(true)
    expect('issues' in schema['~standard'].validate(undefined)).toBe(true)
    expect('issues' in schema['~standard'].validate({})).toBe(true)
    expect('issues' in schema['~standard'].validate([])).toBe(true)
  })

  it('should chain min and max value', () => {
    const schema = t.number().min(10).max(20)
    expect(schema['~standard'].validate(10)).toEqual({ value: 10 })
    expect(schema['~standard'].validate(20)).toEqual({ value: 20 })
    expect('issues' in schema['~standard'].validate(9.99)).toBe(true)
    expect('issues' in schema['~standard'].validate(20.01)).toBe(true)
  })

  it('should chain integer constraint', () => {
    const schema = t.number().integer()
    expect(schema['~standard'].validate(10)).toEqual({ value: 10 })
    expect(schema['~standard'].validate(-5)).toEqual({ value: -5 })
    expect('issues' in schema['~standard'].validate(10.5)).toBe(true)
  })

  it('should chain coerce from string', () => {
    const schema = t.number().coerce().min(1)
    expect(schema['~standard'].validate('42')).toEqual({ value: 42 })
    expect(schema['~standard'].validate('3.14')).toEqual({ value: 3.14 })
    expect('issues' in schema['~standard'].validate('0')).toBe(true)
    expect('issues' in schema['~standard'].validate('invalid')).toBe(true)
    expect('issues' in schema['~standard'].validate('')).toBe(true)
  })

  it('should chain optional and default', () => {
    const optionalSchema = t.number().optional()
    expect(optionalSchema['~standard'].validate(undefined)).toEqual({ value: undefined })
    expect(optionalSchema['~standard'].validate(42)).toEqual({ value: 42 })

    const defaultSchema = t.number().min(0).default(100)
    expect(defaultSchema['~standard'].validate(undefined)).toEqual({ value: 100 })
    expect(defaultSchema['~standard'].validate(200)).toEqual({ value: 200 })
    expect('issues' in defaultSchema['~standard'].validate(-5)).toBe(true)
  })

  describe('immutability across branches', () => {
    it('should not leak constraints between branches built from the same base', () => {
      const base = t.number().min(10)

      const min10Max20 = base.max(20)
      const min10Max50 = base.max(50)

      expect(min10Max20['~standard'].validate(15)).toEqual({ value: 15 })
      expect('issues' in min10Max20['~standard'].validate(30)).toBe(true)

      expect(min10Max50['~standard'].validate(30)).toEqual({ value: 30 })
      expect(base['~standard'].validate(100)).toEqual({ value: 100 })
    })

    it('should maintain coerce isolation across branches', () => {
      const base = t.number()
      const coerced = base.coerce()

      expect('issues' in base['~standard'].validate('42')).toBe(true)
      expect(coerced['~standard'].validate('42')).toEqual({ value: 42 })
    })
  })

  describe('custom error messages', () => {
    it('should use custom message for min constraint', async () => {
      const schema = t.number().min(18, 'Must be at least 18')
      const result = await schema['~standard'].validate(16)

      expect(result.issues).toBeTruthy()
      if (result.issues) {
        expect(result.issues[0]?.message).toBe('Must be at least 18')
      }
    })

    it('should use custom message for max constraint', async () => {
      const schema = t.number().max(100, 'Too high')
      const result = await schema['~standard'].validate(105)

      expect(result.issues).toBeTruthy()
      if (result.issues) {
        expect(result.issues[0]?.message).toBe('Too high')
      }
    })

    it('should use custom base message for invalid type', async () => {
      const schema = t.number('Expected a valid number')
      const result = await schema['~standard'].validate('abc')

      expect(result.issues).toBeTruthy()
      if (result.issues) {
        expect(result.issues[0]?.message).toBe('Expected a valid number')
      }
    })
  })

  describe('issues structure', () => {
    it('should return issues as a array on error', async () => {
      const schema = t.number().integer()
      const result = await schema['~standard'].validate(3.14)

      expect(result.issues).toBeTruthy()
      if (result.issues) {
        expect(Array.isArray(result.issues)).toBe(true)
        expect(result.issues.length).toBeGreaterThan(0)
        expect(typeof result.issues[0]?.message).toBe('string')
      }
    })

    it('should not include issues on success', async () => {
      const schema = t.number()
      const result = await schema['~standard'].validate(10)

      expect(result.issues).toBeUndefined()
      expect(result).toEqual({ value: 10 })
    })
  })

  describe('advanced edge cases & constraint combinations', () => {
    it('should correctly process combined coerce, integer, min, and max', () => {
      const schema = t.number().coerce().integer().min(10).max(100)

      expect(schema['~standard'].validate('50')).toEqual({ value: 50 })
      expect('issues' in schema['~standard'].validate('9.9')).toBe(true)
      expect('issues' in schema['~standard'].validate('10.5')).toBe(true)
      expect('issues' in schema['~standard'].validate('101')).toBe(true)
    })

    it('should handle repeated min() calls (last value should accumulate/override logic)', () => {
      const schema = t.number().min(5).min(20)

      expect('issues' in schema['~standard'].validate(15)).toBe(true)
      expect(schema['~standard'].validate(20)).toEqual({ value: 20 })
    })

    it('should handle repeated max() calls correctly', () => {
      const schema = t.number().max(50).max(10)

      expect('issues' in schema['~standard'].validate(20)).toBe(true)
      expect(schema['~standard'].validate(10)).toEqual({ value: 10 })
    })

    it('should preserve accumulated constraints when default() is chained at the end', () => {
      const schema = t.number().coerce().integer().min(1).max(5).default(3)

      expect(schema['~standard'].validate(undefined)).toEqual({ value: 3 })
      expect(schema['~standard'].validate('4')).toEqual({ value: 4 })
      expect('issues' in schema['~standard'].validate('0')).toBe(true)
      expect('issues' in schema['~standard'].validate('2.5')).toBe(true)
    })

    it('should correctly prioritize custom error message on the failing constraint in a long chain', async () => {
      const schema = t.number('Not a number').min(10, 'Value is too small').max(20, 'Value is too large')

      const minResult = await schema['~standard'].validate(5)
      expect(minResult.issues?.[0]?.message).toBe('Value is too small')

      const maxResult = await schema['~standard'].validate(25)
      expect(maxResult.issues?.[0]?.message).toBe('Value is too large')
    })

    it('should correctly handle boundary conditions for floating point precision', () => {
      const schema = t.number().min(0.1 + 0.2) // 0.30000000000000004

      expect(schema['~standard'].validate(0.30000000000000004)).toEqual({ value: 0.30000000000000004 })
      expect('issues' in schema['~standard'].validate(0.3)).toBe(true)
    })
  })
})
