import { describe, it, expect } from 'vitest'
import { t } from '../index.js'

describe('t.pipe()', () => {
  it('should compose two schemas sequentially', async () => {
    const schema = t.pipe(t.string(), t.transform(t.string(), (s) => s.toUpperCase()))
    expect(await schema['~standard'].validate('hi')).toEqual({ value: 'HI' })
  })

  it('should propagate errors from the first schema', async () => {
    const schema = t.pipe(t.string(), t.transform(t.string(), (s) => s.toUpperCase()))
    expect('issues' in (await schema['~standard'].validate(123))).toBe(true)
  })
})