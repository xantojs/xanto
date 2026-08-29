import { describe, it, expect } from 'vitest'
import { t } from '../index.js'

describe('t.date() with chaining', () => {
  describe('base date validation', () => {
    it('should validate native Date instance', () => {
      const schema = t.date()
      const now = new Date()
      expect(schema['~standard'].validate(now)).toEqual({ value: now })
    })

    it('should reject non-date without coerce', () => {
      const schema = t.date()
      expect('issues' in schema['~standard'].validate('2026-08-27T00:00:00Z')).toBe(true)
      expect('issues' in schema['~standard'].validate(1700000000000)).toBe(true)
      expect('issues' in schema['~standard'].validate(null)).toBe(true)
      expect('issues' in schema['~standard'].validate(undefined)).toBe(true)
      expect('issues' in schema['~standard'].validate({})).toBe(true)
      expect('issues' in schema['~standard'].validate([])).toBe(true)
      expect('issues' in schema['~standard'].validate(NaN)).toBe(true)
    })

    it('should reject Invalid Date objects', () => {
      const schema = t.date()
      const invalidDate = new Date('invalid-date-string')
      expect('issues' in schema['~standard'].validate(invalidDate)).toBe(true)
    })
  })

  describe('coercion', () => {
    it('should coerce ISO string to Date', () => {
      const schema = t.date().coerce()
      const dateStr = '2026-08-27T12:00:00.000Z'
      const result = schema['~standard'].validate(dateStr)

      expect('value' in result && result.value instanceof Date).toBe(true)
      if ('value' in result) {
        expect(result.value.toISOString()).toBe(dateStr)
      }
    })

    it('should coerce numeric timestamp to Date', () => {
      const schema = t.date().coerce()
      const timestamp = 1700000000000
      const result = schema['~standard'].validate(timestamp)

      expect('value' in result && result.value instanceof Date).toBe(true)
      if ('value' in result) {
        expect(result.value.getTime()).toBe(timestamp)
      }
    })

    it('should reject unparseable strings and values even with coerce', () => {
      const schema = t.date().coerce()
      expect('issues' in schema['~standard'].validate('not-a-date')).toBe(true)
      expect('issues' in schema['~standard'].validate(null)).toBe(true)
      expect('issues' in schema['~standard'].validate({})).toBe(true)
      expect('issues' in schema['~standard'].validate(true)).toBe(true)
    })
  })

  describe('min and max constraints', () => {
    it('should validate min date', () => {
      const minDate = new Date('2026-01-01')
      const schema = t.date().min(minDate)

      expect(schema['~standard'].validate(new Date('2026-06-01'))).toEqual({
        value: new Date('2026-06-01'),
      })
      expect(schema['~standard'].validate(new Date('2026-01-01'))).toEqual({
        value: new Date('2026-01-01'),
      })
      expect('issues' in schema['~standard'].validate(new Date('2025-12-31'))).toBe(true)
    })

    it('should validate max date', () => {
      const maxDate = new Date('2026-12-31')
      const schema = t.date().max(maxDate)

      expect(schema['~standard'].validate(new Date('2026-06-01'))).toEqual({
        value: new Date('2026-06-01'),
      })
      expect(schema['~standard'].validate(new Date('2026-12-31'))).toEqual({
        value: new Date('2026-12-31'),
      })
      expect('issues' in schema['~standard'].validate(new Date('2027-01-01'))).toBe(true)
    })

    it('should combine min and max date constraints with coerce', () => {
      const minDate = new Date('2026-01-01')
      const maxDate = new Date('2026-12-31')
      const schema = t.date().coerce().min(minDate).max(maxDate)

      const result = schema['~standard'].validate('2026-06-01T00:00:00.000Z')
      expect('value' in result && result.value instanceof Date).toBe(true)

      expect('issues' in schema['~standard'].validate('2025-01-01T00:00:00.000Z')).toBe(true)
      expect('issues' in schema['~standard'].validate('2027-01-01T00:00:00.000Z')).toBe(true)
    })
  })

  describe('optional and default values', () => {
    it('should return undefined when optional value is undefined', () => {
      const schema = t.date().optional()
      expect(schema['~standard'].validate(undefined)).toEqual({ value: undefined })
    })

    it('should return default value when value is undefined', () => {
      const defaultDate = new Date('2026-01-01')
      const schema = t.date().default(defaultDate)
      expect(schema['~standard'].validate(undefined)).toEqual({ value: defaultDate })
    })

    it('should prioritize provided value over default value', () => {
      const defaultDate = new Date('2026-01-01')
      const inputDate = new Date('2026-05-05')
      const schema = t.date().default(defaultDate)
      expect(schema['~standard'].validate(inputDate)).toEqual({ value: inputDate })
    })
  })

  describe('immutability across branches', () => {
    it('should isolate constraints on independent branches', () => {
      const base = t.date()
      const minSchema = base.min(new Date('2026-01-01'))
      const coercedSchema = base.coerce()

      const pastDate = new Date('2025-01-01')

      expect(base['~standard'].validate(pastDate)).toEqual({ value: pastDate })

      expect('issues' in minSchema['~standard'].validate(pastDate)).toBe(true)

      expect('issues' in base['~standard'].validate('2026-01-01')).toBe(true)
      expect('value' in coercedSchema['~standard'].validate('2026-01-01')).toBe(true)
    })
  })

  describe('custom messages', () => {
    it('should return custom base error message', () => {
      const schema = t.date('Custom date error')
      const result = schema['~standard'].validate('invalid')

      expect('issues' in result && result.issues).toBeTruthy()
      if ('issues' in result && result.issues) {
        expect(result.issues[0]?.message).toBe('Custom date error')
      }
    })

    it('should return custom min/max error messages', () => {
      const minDate = new Date('2026-01-01')
      const maxDate = new Date('2026-12-31')
      const schema = t.date().min(minDate, 'Too early').max(maxDate, 'Too late')

      const minResult = schema['~standard'].validate(new Date('2025-01-01'))
      if ('issues' in minResult && minResult.issues) {
        expect(minResult.issues[0]?.message).toBe('Too early')
      }

      const maxResult = schema['~standard'].validate(new Date('2027-01-01'))
      if ('issues' in maxResult && maxResult.issues) {
        expect(maxResult.issues[0]?.message).toBe('Too late')
      }
    })
  })
})
