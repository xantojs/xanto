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
  })

  it('should chain default value', () => {
    const roleSchema = t.enum(['admin', 'user'] as const).default('user')
    expect(roleSchema['~standard'].validate(undefined)).toEqual({ value: 'user' })
    expect(roleSchema['~standard'].validate('admin')).toEqual({ value: 'admin' })
  })
})
