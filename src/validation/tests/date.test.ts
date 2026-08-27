import { describe, it, expect } from 'vitest'
import { t } from '../index.js'

describe('t.date() with chaining', () => {
  it('should validate native Date instance', () => {
    const schema = t.date()
    const now = new Date()
    expect(schema['~standard'].validate(now)).toEqual({ value: now })
  })

  it('should reject non-date without coerce', () => {
    const schema = t.date()
    expect('issues' in schema['~standard'].validate('2026-08-27T00:00:00Z')).toBe(true)
  })

  it('should coerce ISO string to Date', () => {
    const schema = t.date().coerce()
    const dateStr = '2026-08-27T12:00:00.000Z'
    const result = schema['~standard'].validate(dateStr)
    expect('value' in result && result.value instanceof Date).toBe(true)
    if ('value' in result) {
      expect(result.value.toISOString()).toBe(dateStr)
    }
  })

  it('should validate min date', () => {
    const minDate = new Date('2026-01-01')
    const schema = t.date().min(minDate)
    expect(schema['~standard'].validate(new Date('2026-06-01'))).toEqual({ value: new Date('2026-06-01') })
    expect('issues' in schema['~standard'].validate(new Date('2025-12-31'))).toBe(true)
  })
})
