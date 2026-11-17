import { describe, it, expect } from 'vitest'
import { x } from '../index.js'

describe('x.record()', () => {
  it('should validate keys and values', async () => {
    const schema = x.record(x.string(), x.number())
    expect(await schema['~standard'].validate({ a: 1, b: 2 })).toEqual({ value: { a: 1, b: 2 } })
    expect('issues' in (await schema['~standard'].validate({ a: 'x' }))).toBe(true)
  })

  it('should reject non-object values', async () => {
    const schema = x.record(x.string(), x.number())
    expect('issues' in (await schema['~standard'].validate('nope'))).toBe(true)
    expect('issues' in (await schema['~standard'].validate([]))).toBe(true)
  })

  it('should preserve a key transformed to __proto__ as an own property', async () => {
    const schema = x.record(
      x.transform(x.string(), () => '__proto__'),
      x.object({ enabled: x.boolean() })
    )

    const result = await schema['~standard'].validate({ settings: { enabled: true } })

    if (!('value' in result)) {
      throw new Error('Expected successful validation')
    }

    expect(Object.getPrototypeOf(result.value)).toBe(Object.prototype)
    expect(Object.hasOwn(result.value, '__proto__')).toBe(true)
    expect(result.value['__proto__']).toEqual({ enabled: true })
  })

  it('should reject keys that collide after transformation', async () => {
    const schema = x.record(
      x.transform(x.string(), (key) => key.toLowerCase()),
      x.number()
    )

    expect(await schema['~standard'].validate({ A: 1, a: 2 })).toEqual({
      issues: [{ message: 'Duplicate record key "a"', path: ['a'] }],
    })
  })

  it('should reject a key transformed to an object', async () => {
    const schema = x.record(
      x.transform(x.string(), (key) => ({ key })),
      x.number()
    )

    expect(await schema['~standard'].validate({ a: 1 })).toEqual({
      issues: [{ message: 'Record key must be a string or number', path: ['a'] }],
    })
  })

  it('should accept numeric key results and store them under string keys', async () => {
    const schema = x.record(x.number().coerce(), x.string())

    expect(await schema['~standard'].validate({ '01': 'first' })).toEqual({
      value: { '1': 'first' },
    })
  })

  it('should report both key and nested value errors for the same entry', async () => {
    const schema = x.record(x.string().min(2), x.object({ score: x.number() }))

    const result = await schema['~standard'].validate({ a: { score: 'invalid' } })

    expect(result.issues?.map((issue) => issue.path)).toEqual([['a'], ['a', 'score']])
  })
})
