import { describe, it, expect } from 'vitest'
import { x } from '../index.js'

describe('x.union() with chaining', () => {
  it('should validate string or number', async () => {
    const stringOrNumber = x.union([x.string(), x.number()])
    expect(await stringOrNumber['~standard'].validate('hello')).toEqual({ value: 'hello' })
    expect(await stringOrNumber['~standard'].validate(123)).toEqual({ value: 123 })
  })

  it('should reject value matching none of the union options', async () => {
    const stringOrNumber = x.union([x.string(), x.number()])
    const result = await stringOrNumber['~standard'].validate(true)
    expect('issues' in result && result.issues).toBeTruthy()
  })

  it('should chain default value', async () => {
    const schema = x.union([x.string(), x.number()]).default('default-str')
    expect(await schema['~standard'].validate(undefined)).toEqual({ value: 'default-str' })
  })

  it('should chain optional without default', async () => {
    const schema = x.union([x.string(), x.number()]).optional()
    expect(await schema['~standard'].validate(undefined)).toEqual({ value: undefined })
    expect(await schema['~standard'].validate('hi')).toEqual({ value: 'hi' })
  })

  it('should return the first matching option, not the last', async () => {
    const schema = x.union([x.string(), x.number()])
    expect(await schema['~standard'].validate('123')).toEqual({ value: '123' })
  })

  it('should validate against a schema with constraints inside the union', async () => {
    const schema = x.union([x.string().email(), x.literal('anonymous')])
    expect(await schema['~standard'].validate('user@xanto.org')).toEqual({ value: 'user@xanto.org' })
    expect(await schema['~standard'].validate('anonymous')).toEqual({ value: 'anonymous' })

    const result = await schema['~standard'].validate('not-an-email')
    expect('issues' in result && result.issues).toBeTruthy()
  })

  describe('immutability across branches', () => {
    it('should not affect base schema when calling default() on it', async () => {
      const base = x.union([x.string(), x.number()])
      const withDefault = base.default('fallback')

      const baseResult = await base['~standard'].validate(undefined)
      expect('issues' in baseResult && baseResult.issues).toBeTruthy()

      expect(await withDefault['~standard'].validate(undefined)).toEqual({ value: 'fallback' })
    })

    it('should keep independent defaults for schemas built from the same base', async () => {
      const base = x.union([x.string(), x.number()])

      const branchA = base.default('A')
      const branchB = base.default(0)

      expect(await branchA['~standard'].validate(undefined)).toEqual({ value: 'A' })
      expect(await branchB['~standard'].validate(undefined)).toEqual({ value: 0 })
    })
  })

  describe('exposed options', () => {
    it('should expose the original schema options array', () => {
      const stringSchema = x.string()
      const numberSchema = x.number()
      const schema = x.union([stringSchema, numberSchema])

      expect(schema.options).toEqual([stringSchema, numberSchema])
    })

    it('should preserve options after chaining optional', () => {
      const stringSchema = x.string()
      const numberSchema = x.number()
      const schema = x.union([stringSchema, numberSchema]).optional()

      expect(schema.options).toEqual([stringSchema, numberSchema])
    })
  })

  describe('edge cases', () => {
    it('should reject when union has a single option and value does not match', async () => {
      const schema = x.union([x.literal('only')])
      const result = await schema['~standard'].validate('other')
      expect('issues' in result && result.issues).toBeTruthy()
    })

    it('should use custom message when nothing matches', async () => {
      const schema = x.union([x.string(), x.number()], 'Must be a string or a number')
      const result = await schema['~standard'].validate(true)

      expect('issues' in result && result.issues).toBeTruthy()
      if ('issues' in result && result.issues) {
        expect(result.issues[0]?.message).toBe('Must be a string or a number')
      }
    })
  })
})
