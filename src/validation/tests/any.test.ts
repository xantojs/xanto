import { describe, it, expect } from 'vitest'
import { t } from '../index.js'

describe('t.any() and t.unknown()', () => {
  describe('t.any()', () => {
    it('should pass through any provided value', () => {
      const schema = t.any()

      expect(schema['~standard'].validate('hello')).toEqual({ value: 'hello' })
      expect(schema['~standard'].validate(123)).toEqual({ value: 123 })
      expect(schema['~standard'].validate(true)).toEqual({ value: true })
      expect(schema['~standard'].validate(null)).toEqual({ value: null })
      expect(schema['~standard'].validate({ key: 'value' })).toEqual({ value: { key: 'value' } })
      expect(schema['~standard'].validate([1, 2, 3])).toEqual({ value: [1, 2, 3] })
    })

    it('should handle optional and default values correctly', () => {
      const optionalSchema = t.any().optional()
      expect(optionalSchema['~standard'].validate(undefined)).toEqual({ value: undefined })
      expect(optionalSchema['~standard'].validate('value')).toEqual({ value: 'value' })

      const defaultSchema = t.any().default('fallback')
      expect(defaultSchema['~standard'].validate(undefined)).toEqual({ value: 'fallback' })
      expect(defaultSchema['~standard'].validate('custom')).toEqual({ value: 'custom' })
    })

    it('should maintain immutability on chaining', () => {
      const base = t.any()
      const withDefaultA = base.default('A')
      const withDefaultB = base.default('B')

      expect(withDefaultA['~standard'].validate(undefined)).toEqual({ value: 'A' })
      expect(withDefaultB['~standard'].validate(undefined)).toEqual({ value: 'B' })
      expect(base['~standard'].validate(undefined)).toEqual({ value: undefined })
    })
  })

  describe('t.unknown()', () => {
    it('should pass through any provided value as unknown', () => {
      const schema = t.unknown()

      expect(schema['~standard'].validate('text')).toEqual({ value: 'text' })
      expect(schema['~standard'].validate(42)).toEqual({ value: 42 })
      expect(schema['~standard'].validate(false)).toEqual({ value: false })
      expect(schema['~standard'].validate(undefined)).toEqual({ value: undefined })
    })

    it('should handle optional and default values correctly', () => {
      const defaultSchema = t.unknown().default(0)

      expect(defaultSchema['~standard'].validate(undefined)).toEqual({ value: 0 })
      expect(defaultSchema['~standard'].validate(10)).toEqual({ value: 10 })
    })
  })
})
