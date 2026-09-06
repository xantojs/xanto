import { describe, it, expect } from 'vitest'
import { x } from '../index.js'

describe('x.transform()', () => {
  it('should map validated output', async () => {
    const schema = x.transform(x.string(), (s) => s.length)
    expect(await schema['~standard'].validate('hello')).toEqual({ value: 5 })
  })

  it('should propagate validation errors from the source schema', async () => {
    const schema = x.transform(x.number(), (n) => n * 2)
    expect(await schema['~standard'].validate(21)).toEqual({ value: 42 })
    expect('issues' in (await schema['~standard'].validate('x'))).toBe(true)
  })
})
