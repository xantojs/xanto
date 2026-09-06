import { describe, it, expect } from 'vitest'
import { t } from '../index.js'

describe('t.record()', () => {
  it('should validate keys and values', async () => {
    const schema = t.record(t.string(), t.number())
    expect(await schema['~standard'].validate({ a: 1, b: 2 })).toEqual({ value: { a: 1, b: 2 } })
    expect('issues' in (await schema['~standard'].validate({ a: 'x' }))).toBe(true)
  })

  it('should reject non-object values', async () => {
    const schema = t.record(t.string(), t.number())
    expect('issues' in (await schema['~standard'].validate('nope'))).toBe(true)
    expect('issues' in (await schema['~standard'].validate([]))).toBe(true)
  })
})
