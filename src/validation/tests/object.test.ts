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
})
