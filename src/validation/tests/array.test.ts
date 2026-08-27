import { describe, it, expect } from 'vitest'
import { t } from '../index.js'

describe('t.array() with chaining', () => {
  it('should validate array of items', async () => {
    const schema = t.array(t.number())
    const result = await schema['~standard'].validate([1, 2, 3])
    expect(result).toEqual({ value: [1, 2, 3] })
  })

  it('should reject non-array values', async () => {
    const schema = t.array(t.string())
    const result = await schema['~standard'].validate('not an array')
    expect('issues' in result && result.issues).toBeTruthy()
  })

  it('should chain min and max items', async () => {
    const schema = t.array(t.number()).min(2).max(4)
    expect(await schema['~standard'].validate([1, 2])).toEqual({ value: [1, 2] })
    expect(await schema['~standard'].validate([1, 2, 3, 4])).toEqual({ value: [1, 2, 3, 4] })

    const tooFew = await schema['~standard'].validate([1])
    expect('issues' in tooFew).toBe(true)

    const tooMany = await schema['~standard'].validate([1, 2, 3, 4, 5])
    expect('issues' in tooMany).toBe(true)
  })

  it('should chain exact length', async () => {
    const schema = t.array(t.string()).length(3)
    expect(await schema['~standard'].validate(['a', 'b', 'c'])).toEqual({ value: ['a', 'b', 'c'] })

    const wrongLength = await schema['~standard'].validate(['a', 'b'])
    expect('issues' in wrongLength).toBe(true)
  })

  it('should chain optional and default', async () => {
    const schema = t.array(t.string()).default(['guest'])
    expect(await schema['~standard'].validate(undefined)).toEqual({ value: ['guest'] })
  })
})
