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
    expect('issues' in schema['~standard'].validate(10.5)).toBe(true)
  })

  it('should chain coerce from string', () => {
    const schema = t.number().coerce().min(1)
    expect(schema['~standard'].validate('42')).toEqual({ value: 42 })
    expect(schema['~standard'].validate('3.14')).toEqual({ value: 3.14 })
    expect('issues' in schema['~standard'].validate('0')).toBe(true)
    expect('issues' in schema['~standard'].validate('invalid')).toBe(true)
  })

  it('should chain optional and default', () => {
    const schema = t.number().min(0).default(100)
    expect(schema['~standard'].validate(undefined)).toEqual({ value: 100 })
    expect(schema['~standard'].validate(200)).toEqual({ value: 200 })
  })
})