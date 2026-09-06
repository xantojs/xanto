import { describe, it, expect } from 'vitest'
import { t } from '../index.js'

describe('t.tuple()', () => {
  it('should validate a fixed-length tuple', async () => {
    const schema = t.tuple([t.string(), t.number()])
    expect(await schema['~standard'].validate(['a', 1])).toEqual({ value: ['a', 1] })
    expect('issues' in (await schema['~standard'].validate(['a']))).toBe(true)
    expect('issues' in (await schema['~standard'].validate(['a', 'b']))).toBe(true)
  })

  it('should report per-item paths', async () => {
    const schema = t.tuple([t.string(), t.number()])
    const result = await schema['~standard'].validate(['a', 'not-a-number'])
    expect('issues' in result && result.issues).toBeTruthy()
    if ('issues' in result && result.issues) {
      expect(result.issues[0]?.path).toEqual([1])
    }
  })

  it('should support default chaining', async () => {
    const schema = t.tuple([t.number()]).default([7])
    expect(await schema['~standard'].validate(undefined)).toEqual({ value: [7] })
  })
})