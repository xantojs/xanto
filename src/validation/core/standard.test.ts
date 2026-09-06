import { describe, it, expect } from 'vitest'
import { toStandardResult, createStandardSchema } from './standard.js'

describe('validation/core/standard', () => {
  it('toStandardResult formats success', () => {
    const res = toStandardResult({ success: true, output: 42 })
    expect(res).toEqual({ value: 42 })
  })

  it('toStandardResult formats failure with paths', () => {
    const res = toStandardResult({
      success: false,
      issues: [
        { message: 'Invalid', path: [{ key: 'user' }, { key: 'name' }] },
        { message: 'Global error', path: undefined },
      ],
    })
    expect(res).toEqual({
      issues: [
        { message: 'Invalid', path: ['user', 'name'] },
        { message: 'Global error', path: undefined },
      ],
    })
  })

  it('createStandardSchema complies with Standard Schema v1', async () => {
    const schema = createStandardSchema((val) => {
      if (typeof val === 'number') return { value: val * 2 }
      return { issues: [{ message: 'Must be number' }] }
    })

    expect(schema['~standard'].version).toBe(1)
    expect(schema['~standard'].vendor).toBe('xanto')

    const success = await schema['~standard'].validate(10)
    expect(success).toEqual({ value: 20 })

    const fail = await schema['~standard'].validate('abc')
    expect(fail).toEqual({ issues: [{ message: 'Must be number' }] })
  })
})
