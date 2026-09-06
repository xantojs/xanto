import { describe, it, expect } from 'vitest'
import { x } from '../index.js'

describe('x.pipe()', () => {
  it('should compose two schemas sequentially', async () => {
    const schema = x.pipe(x.string(), x.transform(x.string(), (s) => s.toUpperCase()))
    expect(await schema['~standard'].validate('hi')).toEqual({ value: 'HI' })
  })

  it('should propagate errors from the first schema', async () => {
    const schema = x.pipe(x.string(), x.transform(x.string(), (s) => s.toUpperCase()))
    expect('issues' in (await schema['~standard'].validate(123))).toBe(true)
  })
})
