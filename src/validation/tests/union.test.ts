import { describe, it, expect } from 'vitest'
import { t } from '../index.js'

describe('t.union() with chaining', () => {
  it('should validate string or number', async () => {
    const stringOrNumber = t.union([t.string(), t.number()])
    expect(await stringOrNumber['~standard'].validate('hello')).toEqual({ value: 'hello' })
    expect(await stringOrNumber['~standard'].validate(123)).toEqual({ value: 123 })
  })

  it('should reject value matching none of the union options', async () => {
    const stringOrNumber = t.union([t.string(), t.number()])
    const result = await stringOrNumber['~standard'].validate(true)
    expect('issues' in result && result.issues).toBeTruthy()
  })

  it('should chain default value', async () => {
    const schema = t.union([t.string(), t.number()]).default('default-str')
    expect(await schema['~standard'].validate(undefined)).toEqual({ value: 'default-str' })
  })
})
