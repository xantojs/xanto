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

  describe('element issues and paths tracking', () => {
    it('should aggregate issues from multiple invalid elements with proper index paths', async () => {
      const schema = t.array(t.number())
      const result = await schema['~standard'].validate([1, 'invalid', 3, 'bad'])

      expect('issues' in result && result.issues).toBeTruthy()
      if ('issues' in result && result.issues) {
        expect(result.issues.length).toBe(2)
        expect(result.issues[0]?.path).toEqual([1])
        expect(result.issues[1]?.path).toEqual([3])
      }
    })

    it('should preserve deep nested paths from item schema validation', async () => {
      const mockObjectSchema = {
        '~standard': {
          version: 1 as const,
          vendor: 'xanto',
          validate: async (val: any) => {
            if (typeof val?.age !== 'number') {
              return { issues: [{ message: 'Expected number', path: ['age'] }] }
            }
            return { value: val }
          },
          types: { input: undefined, output: undefined },
        },
      }

      const schema = t.array(mockObjectSchema)
      const result = await schema['~standard'].validate([{ age: 20 }, { age: 'invalid' }])

      expect('issues' in result && result.issues).toBeTruthy()
      if ('issues' in result && result.issues) {
        expect(result.issues[0]?.path).toEqual([1, 'age'])
      }
    })
  })

  describe('immutability across branches', () => {
    it('should isolate constraints when branching from the same base array schema', async () => {
      const base = t.array(t.number())
      const minTwo = base.min(2)
      const maxTwo = base.max(2)

      const sample = [1, 2, 3]

      expect(await base['~standard'].validate(sample)).toEqual({ value: [1, 2, 3] })
      expect(await minTwo['~standard'].validate(sample)).toEqual({ value: [1, 2, 3] })

      const maxResult = await maxTwo['~standard'].validate(sample)
      expect('issues' in maxResult).toBe(true)
    })

    it('should isolate optional/default modifications across branches', async () => {
      const base = t.array(t.string())
      const withDefaultA = base.default(['a'])
      const withDefaultB = base.default(['b'])

      expect(await withDefaultA['~standard'].validate(undefined)).toEqual({ value: ['a'] })
      expect(await withDefaultB['~standard'].validate(undefined)).toEqual({ value: ['b'] })
      expect('issues' in (await base['~standard'].validate(undefined))).toBe(true)
    })
  })

  describe('custom messages & edge cases', () => {
    it('should use custom error message for root array type failure', async () => {
      const schema = t.array(t.number(), 'Custom array expected message')
      const result = await schema['~standard'].validate('not-an-array')

      expect('issues' in result && result.issues).toBeTruthy()
      if ('issues' in result && result.issues) {
        expect(result.issues[0]?.message).toBe('Custom array expected message')
      }
    })

    it('should validate empty arrays when constraints permit', async () => {
      const schema = t.array(t.number()).min(0)
      expect(await schema['~standard'].validate([])).toEqual({ value: [] })

      const strictMinSchema = t.array(t.number()).min(1)
      expect('issues' in (await strictMinSchema['~standard'].validate([]))).toBe(true)
    })

    it('should correctly handle repeated length/min/max constraint overrides', async () => {
      const schema = t.array(t.string()).min(2).min(5)

      expect('issues' in (await schema['~standard'].validate(['a', 'b', 'c']))).toBe(true)
      expect(await schema['~standard'].validate(['a', 'b', 'c', 'd', 'e'])).toEqual({
        value: ['a', 'b', 'c', 'd', 'e'],
      })
    })

    it('should validate nested arrays correctly', async () => {
      const nestedSchema = t.array(t.array(t.number()))
      const validData = [
        [1, 2],
        [3, 4, 5],
      ]
      const invalidData = [
        [1, 2],
        [3, 'invalid'],
      ]

      expect(await nestedSchema['~standard'].validate(validData)).toEqual({ value: validData })

      const result = await nestedSchema['~standard'].validate(invalidData)
      expect('issues' in result && result.issues).toBeTruthy()
      if ('issues' in result && result.issues) {
        expect(result.issues[0]?.path).toEqual([1, 1])
      }
    })
  })
})
