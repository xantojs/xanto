import { describe, it, expect } from 'vitest'
import { x } from '../index.js'

describe('x.string() with chaining', () => {
  it('should validate basic string', () => {
    const schema = x.string()
    expect(schema['~standard'].validate('hello')).toEqual({ value: 'hello' })
    expect(schema['~standard'].validate('')).toEqual({ value: '' })
  })

  it('should reject non-string values', () => {
    const schema = x.string()
    expect('issues' in schema['~standard'].validate(123)).toBe(true)
    expect('issues' in schema['~standard'].validate(null)).toBe(true)
    expect('issues' in schema['~standard'].validate(undefined)).toBe(true)
  })

  it('should chain min and max length', () => {
    const schema = x.string().min(3).max(5)
    expect(schema['~standard'].validate('abc')).toEqual({ value: 'abc' })
    expect(schema['~standard'].validate('abcde')).toEqual({ value: 'abcde' })
    expect('issues' in schema['~standard'].validate('ab')).toBe(true)
    expect('issues' in schema['~standard'].validate('abcdef')).toBe(true)
  })

  it('should chain length', () => {
    const schema = x.string().length(4)
    expect(schema['~standard'].validate('test')).toEqual({ value: 'test' })
    expect('issues' in schema['~standard'].validate('abc')).toBe(true)
    expect('issues' in schema['~standard'].validate('abcde')).toBe(true)
  })

  it('should chain email format', () => {
    const schema = x.string().email()
    expect(schema['~standard'].validate('user@xanto.org')).toEqual({ value: 'user@xanto.org' })
    expect('issues' in schema['~standard'].validate('not-an-email')).toBe(true)
  })

  it('should chain url format', () => {
    const schema = x.string().url()
    expect(schema['~standard'].validate('https://xanto.js.org')).toEqual({ value: 'https://xanto.js.org' })
    expect('issues' in schema['~standard'].validate('invalid-url')).toBe(true)
  })

  it('should chain uuid format', () => {
    const schema = x.string().uuid()
    const validUuid = '123e4567-e89b-12d3-a456-426614174000'
    expect(schema['~standard'].validate(validUuid)).toEqual({ value: validUuid })
    expect('issues' in schema['~standard'].validate('not-a-uuid')).toBe(true)
  })

  it('should chain regex', () => {
    const schema = x.string().regex(/^[A-Z]{3}$/)
    expect(schema['~standard'].validate('ABC')).toEqual({ value: 'ABC' })
    expect('issues' in schema['~standard'].validate('abc')).toBe(true)
  })

  it('should chain optional and default', () => {
    const optionalSchema = x.string().optional()
    expect(optionalSchema['~standard'].validate(undefined)).toEqual({ value: undefined })
    expect(optionalSchema['~standard'].validate('hello')).toEqual({ value: 'hello' })

    const defaultSchema = x.string().default('guest')
    expect(defaultSchema['~standard'].validate(undefined)).toEqual({ value: 'guest' })
    expect(defaultSchema['~standard'].validate('alex')).toEqual({ value: 'alex' })
  })

  describe('immutability across branches', () => {
    it('should not leak constraints between branches built from the same base', () => {
      const base = x.string().min(3)

      const emailBranch = base.email()
      const urlBranch = base.url()

      expect(emailBranch['~standard'].validate('user@xanto.org')).toEqual({ value: 'user@xanto.org' })
      expect('issues' in emailBranch['~standard'].validate('https://xanto.org')).toBe(true)

      expect(urlBranch['~standard'].validate('https://xanto.org')).toEqual({ value: 'https://xanto.org' })
      expect('issues' in urlBranch['~standard'].validate('user@xanto.org')).toBe(true)

      expect(base['~standard'].validate('abc')).toEqual({ value: 'abc' })
    })

    it('should keep base schema reusable for multiple independent chains', () => {
      const base = x.string()

      const minSchema = base.min(5)
      const maxSchema = base.max(2)

      expect(minSchema['~standard'].validate('hello')).toEqual({ value: 'hello' })

      expect(maxSchema['~standard'].validate('ab')).toEqual({ value: 'ab' })

      expect(base['~standard'].validate('x')).toEqual({ value: 'x' })
    })

    it('should not mutate schema when calling the same method twice on different branches', () => {
      const base = x.string().min(3)

      const branchA = base.max(10)
      const branchB = base.max(2)

      expect(branchA['~standard'].validate('abcdefg')).toEqual({ value: 'abcdefg' })

      expect('issues' in branchB['~standard'].validate('abcdefg')).toBe(true)
    })
  })

  describe('combined constraints', () => {
    it('should apply min + max + regex together', () => {
      const schema = x
        .string()
        .min(3)
        .max(10)
        .regex(/^[a-z]+$/)

      expect(schema['~standard'].validate('abcdef')).toEqual({ value: 'abcdef' })
      expect('issues' in schema['~standard'].validate('ab')).toBe(true)
      expect('issues' in schema['~standard'].validate('abcdefghijk')).toBe(true)
      expect('issues' in schema['~standard'].validate('ABCDEF')).toBe(true)
    })

    it('should preserve accumulated constraints after chaining optional', () => {
      const schema = x.string().min(3).max(10).optional()

      expect(schema['~standard'].validate(undefined)).toEqual({ value: undefined })

      expect(schema['~standard'].validate('abcde')).toEqual({ value: 'abcde' })
      expect('issues' in schema['~standard'].validate('a')).toBe(true)
      expect('issues' in schema['~standard'].validate('abcdefghijk')).toBe(true)
    })

    it('should preserve accumulated constraints after chaining default', () => {
      const schema = x.string().min(3).default('xyz')

      expect(schema['~standard'].validate(undefined)).toEqual({ value: 'xyz' })
      expect(schema['~standard'].validate('abcd')).toEqual({ value: 'abcd' })
      expect('issues' in schema['~standard'].validate('ab')).toBe(true)
    })

    it('should allow repeated min() calls in the same chain (last constraint applies cumulatively)', () => {
      // @ts-expect-error - second min() should not be allowed by types
      const schema = x.string().min(1).min(5)

      expect('issues' in schema['~standard'].validate('abc')).toBe(true)
      expect(schema['~standard'].validate('abcde')).toEqual({ value: 'abcde' })
    })
  })

  describe('custom error messages', () => {
    it('should use custom message for min constraint', async () => {
      const schema = x.string().min(5, 'Too short!')
      const result = await schema['~standard'].validate('ab')

      expect(result.issues).toBeTruthy()
      if (result.issues) {
        expect(result.issues[0]?.message).toBe('Too short!')
      }
    })

    it('should use custom message for email constraint', async () => {
      const schema = x.string().email('Invalid email address')
      const result = await schema['~standard'].validate('not-an-email')

      expect(result.issues).toBeTruthy()
      if (result.issues) {
        expect(result.issues[0]?.message).toBe('Invalid email address')
      }
    })

    it('should use custom base message for wrong type', async () => {
      const schema = x.string('Expected a string value')
      const result = await schema['~standard'].validate(42)

      expect(result.issues).toBeTruthy()
      if (result.issues) {
        expect(result.issues[0]?.message).toBe('Expected a string value')
      }
    })
  })

  describe('issues structure', () => {
    it('should return issues as a readonly array with message field', async () => {
      const schema = x.string().min(5)
      const result = await schema['~standard'].validate('ab')

      expect(result.issues).toBeTruthy()
      if (result.issues) {
        expect(Array.isArray(result.issues)).toBe(true)
        expect(result.issues.length).toBeGreaterThan(0)
        expect(typeof result.issues[0]?.message).toBe('string')
      }
    })

    it('should not include issues field on success', async () => {
      const schema = x.string()
      const result = await schema['~standard'].validate('ok')

      expect(result.issues).toBeUndefined()
      expect(result).toEqual({ value: 'ok' })
    })
  })

  describe('edge cases', () => {
    it('should treat empty string as valid unless min/length enforces otherwise', () => {
      expect(x.string()['~standard'].validate('')).toEqual({ value: '' })
      expect('issues' in x.string().min(1)['~standard'].validate('')).toBe(true)
    })

    it('should count unicode characters correctly for length constraints', () => {
      const schema = x.string().length(3)
      expect(schema['~standard'].validate('привет'.slice(0, 3))).toEqual({ value: 'при' })
    })

    it('should reject arrays and objects as string values', () => {
      const schema = x.string()
      expect('issues' in schema['~standard'].validate([])).toBe(true)
      expect('issues' in schema['~standard'].validate({})).toBe(true)
    })

    it('should handle multiple independent optional schemas without shared default state', () => {
      const schemaA = x.string().default('A')
      const schemaB = x.string().default('B')

      expect(schemaA['~standard'].validate(undefined)).toEqual({ value: 'A' })
      expect(schemaB['~standard'].validate(undefined)).toEqual({ value: 'B' })
    })
  })
})
