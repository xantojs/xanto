import { describe, it, expect } from 'vitest'
import { parse, safeParse } from './index'
import { ValidationError } from './index'
import { t } from './index'

describe('Validation Parse Utilities', () => {
  const schema = t.object({
    username: t.string(),
    age: t.number(),
  })

  it('should successfully parse valid data and return typed output', async () => {
    const input = { username: 'Quarnel', age: 29 }
    const res = await parse(schema, input)

    expect(res).toEqual(input)
  })

  it('should throw ValidationError when parsing invalid data', async () => {
    const input = { username: 'Quarnel', age: 's' }

    try {
      await parse(schema, input)
    } catch (err) {
      if (err instanceof ValidationError) {
        expect(err.issuses.length).toBeGreaterThan(0)
        expect(err.name).toBe('ValidationError')
      }
    }
  })

  it('should return success: true with data in safeParse for valid input', async () => {
    const input = { username: 'Quarnel', age: 67 }
    const res = await safeParse(schema, input)

    expect(res.success).toBe(true)
    if (res.success) expect(res.data).toEqual(input)
  })

  it('should return success: false with issues in safeParse for invalid input', async () => {
    const input = { username: 1, age: 1 }
    const res = await safeParse(schema, input)

    expect(res.success).toBe(false)
    if (!res.success) expect(res.issues.length).toBeGreaterThan(0)
  })
})
