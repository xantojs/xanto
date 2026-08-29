import { describe, it, expect } from 'vitest'
import { t } from '../index.js'

describe('t.object() with chaining', () => {
  it('should validate object with chaining fields', async () => {
    const userSchema = t.object({
      id: t.string().uuid(),
      name: t.string().min(2),
      age: t.number().min(18).optional(),
      active: t.boolean().default(true),
    })

    const validUuid = '123e4567-e89b-12d3-a456-426614174000'
    const result = await userSchema['~standard'].validate({
      id: validUuid,
      name: 'Alex',
      age: 25,
      active: true,
    })

    expect(result).toEqual({
      value: {
        id: validUuid,
        name: 'Alex',
        age: 25,
        active: true,
      },
    })
  })

  it('should reject non-object values', async () => {
    const schema = t.object({ name: t.string() })
    expect('issues' in (await schema['~standard'].validate('string'))).toBe(true)
    expect('issues' in (await schema['~standard'].validate(null))).toBe(true)
    expect('issues' in (await schema['~standard'].validate([]))).toBe(true)
  })

  it('should report correct path for invalid fields', async () => {
    const schema = t.object({
      name: t.string(),
      age: t.number().min(18),
    })

    const result = await schema['~standard'].validate({
      name: 'Alex',
      age: 15,
    })

    expect('issues' in result && result.issues).toBeTruthy()
    if ('issues' in result && result.issues) {
      expect(result.issues[0].path).toEqual(['age'])
    }
  })

  it('should validate nested objects and arrays', async () => {
    const schema = t.object({
      user: t.object({
        name: t.string().min(2),
        email: t.string().email(),
      }),
      roles: t.array(t.string()),
    })

    const valid = await schema['~standard'].validate({
      user: { name: 'John', email: 'john@xanto.org' },
      roles: ['admin', 'editor'],
    })

    expect(valid).toEqual({
      value: {
        user: { name: 'John', email: 'john@xanto.org' },
        roles: ['admin', 'editor'],
      },
    })
  })

  it('should accept missing keys when field schema is optional', async () => {
    const schema = t.object({
      name: t.string(),
      nickname: t.string().optional(),
    })

    const result = await schema['~standard'].validate({ name: 'Alex' })

    expect(result).toEqual({ value: { name: 'Alex', nickname: undefined } })
  })

  it('should apply default values for missing optional fields', async () => {
    const schema = t.object({
      name: t.string(),
      role: t.string().default('guest'),
    })

    const result = await schema['~standard'].validate({ name: 'Alex' })

    expect(result).toEqual({ value: { name: 'Alex', role: 'guest' } })
  })

  it('should report multiple issues for multiple invalid fields', async () => {
    const schema = t.object({
      name: t.string().min(3),
      age: t.number().min(18),
    })

    const result = await schema['~standard'].validate({ name: 'Al', age: 10 })

    expect('issues' in result && result.issues).toBeTruthy()
    if ('issues' in result && result.issues) {
      expect(result.issues.length).toBe(2)
    }
  })

  it('should ignore extra keys not present in shape', async () => {
    const schema = t.object({ name: t.string() })

    const result = await schema['~standard'].validate({ name: 'Alex', extra: 'ignored' })

    expect(result).toEqual({ value: { name: 'Alex' } })
  })

  it('should use custom message for non-object rejection', async () => {
    const schema = t.object({ name: t.string() }, 'Expected a user object')

    const result = await schema['~standard'].validate('not-an-object')

    expect('issues' in result && result.issues).toBeTruthy()
    if ('issues' in result && result.issues) {
      expect(result.issues[0]?.message).toBe('Expected a user object')
    }
  })

  describe('immutability across branches', () => {
    it('should not affect base schema when calling default() on it', async () => {
      const base = t.object({ name: t.string() })
      const withDefault = base.default({ name: 'guest' })

      expect('issues' in (await base['~standard'].validate(undefined))).toBe(true)
      expect(await withDefault['~standard'].validate(undefined)).toEqual({ value: { name: 'guest' } })
    })
  })

  describe('exposed shape', () => {
    it('should expose the original shape', () => {
      const nameSchema = t.string()
      const schema = t.object({ name: nameSchema })
      expect(schema.shape.name).toBe(nameSchema)
    })

    it('should preserve shape after chaining optional', () => {
      const nameSchema = t.string()
      const schema = t.object({ name: nameSchema }).optional()
      expect(schema.shape.name).toBe(nameSchema)
    })
  })

  describe('edge cases', () => {
    it('should validate an empty shape against an empty object', async () => {
      const schema = t.object({})
      expect(await schema['~standard'].validate({})).toEqual({ value: {} })
    })

    it('should reject arrays even though typeof array is object', async () => {
      const schema = t.object({ name: t.string() })
      expect('issues' in (await schema['~standard'].validate(['a', 'b']))).toBe(true)
    })
  })
})
