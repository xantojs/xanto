import { describe, it, expect } from 'vitest'
import { t } from '../index.js'

describe('t.enum() with chaining', () => {
  it('should validate allowed enum options', () => {
    const roleSchema = t.enum(['admin', 'user', 'guest'] as const)
    expect(roleSchema['~standard'].validate('admin')).toEqual({ value: 'admin' })
    expect(roleSchema['~standard'].validate('user')).toEqual({ value: 'user' })
    expect(roleSchema['~standard'].validate('guest')).toEqual({ value: 'guest' })
  })

  it('should reject invalid values', () => {
    const roleSchema = t.enum(['admin', 'user'] as const)
    expect('issues' in roleSchema['~standard'].validate('superadmin')).toBe(true)
    expect('issues' in roleSchema['~standard'].validate(123)).toBe(true)
    expect('issues' in roleSchema['~standard'].validate(null)).toBe(true)
    expect('issues' in roleSchema['~standard'].validate(undefined)).toBe(true)
  })

  it('should chain default value', () => {
    const roleSchema = t.enum(['admin', 'user'] as const).default('user')
    expect(roleSchema['~standard'].validate(undefined)).toEqual({ value: 'user' })
    expect(roleSchema['~standard'].validate('admin')).toEqual({ value: 'admin' })
  })

  it('should chain optional without default', () => {
    const roleSchema = t.enum(['admin', 'user'] as const).optional()
    expect(roleSchema['~standard'].validate(undefined)).toEqual({ value: undefined })
    expect(roleSchema['~standard'].validate('user')).toEqual({ value: 'user' })
  })

  it('should reject invalid values even when optional', () => {
    const roleSchema = t.enum(['admin', 'user'] as const).optional()
    expect('issues' in roleSchema['~standard'].validate('superadmin')).toBe(true)
  })

  describe('immutability across branches', () => {
    it('should not affect base schema when calling default() on it', () => {
      const base = t.enum(['admin', 'user', 'guest'] as const)
      const withDefault = base.default('guest')

      expect('issues' in base['~standard'].validate(undefined)).toBe(true)
      expect(withDefault['~standard'].validate(undefined)).toEqual({ value: 'guest' })
    })

    it('should keep independent defaults for schemas built from the same base', () => {
      const base = t.enum(['admin', 'user', 'guest'] as const)

      const adminDefault = base.default('admin')
      const userDefault = base.default('user')

      expect(adminDefault['~standard'].validate(undefined)).toEqual({ value: 'admin' })
      expect(userDefault['~standard'].validate(undefined)).toEqual({ value: 'user' })
      expect(adminDefault['~standard'].validate(undefined)).toEqual({ value: 'admin' })
    })
  })

  describe('exposed options', () => {
    it('should expose the original options array', () => {
      const roleSchema = t.enum(['admin', 'user', 'guest'] as const)
      expect(roleSchema.options).toEqual(['admin', 'user', 'guest'])
    })

    it('should preserve options after chaining default', () => {
      const roleSchema = t.enum(['admin', 'user'] as const).default('user')
      expect(roleSchema.options).toEqual(['admin', 'user'])
    })
  })

  describe('issues structure', () => {
    it('should return issues with message field on failure', () => {
      const roleSchema = t.enum(['admin', 'user'] as const)
      const result = roleSchema['~standard'].validate('invalid')

      expect('issues' in result).toBe(true)
      if ('issues' in result && result.issues) {
        expect(Array.isArray(result.issues)).toBe(true)
        expect(typeof result.issues[0]?.message).toBe('string')
      }
    })

    it('should use custom message on failure', () => {
      const roleSchema = t.enum(['admin', 'user'] as const, 'Invalid role')
      const result = roleSchema['~standard'].validate('invalid')

      expect('issues' in result).toBe(true)
      if ('issues' in result && result.issues) {
        expect(result.issues[0]?.message).toBe('Invalid role')
      }
    })
  })

  describe('edge cases', () => {
    it('should work with a single-option enum', () => {
      const singleSchema = t.enum(['only'] as const)
      expect(singleSchema['~standard'].validate('only')).toEqual({ value: 'only' })
      expect('issues' in singleSchema['~standard'].validate('other')).toBe(true)
    })

    it('should reject arrays and objects as enum values', () => {
      const roleSchema = t.enum(['admin', 'user'] as const)
      expect('issues' in roleSchema['~standard'].validate([])).toBe(true)
      expect('issues' in roleSchema['~standard'].validate({})).toBe(true)
    })

    it('should be case-sensitive', () => {
      const roleSchema = t.enum(['Admin', 'User'] as const)
      expect('issues' in roleSchema['~standard'].validate('admin')).toBe(true)
      expect(roleSchema['~standard'].validate('Admin')).toEqual({ value: 'Admin' })
    })
  })
})
