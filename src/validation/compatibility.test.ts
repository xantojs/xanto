import { describe, it, expect } from 'vitest'
import { parse, safeParse, ValidationError, x } from './index.js'
import * as v from 'valibot'
import { z } from 'zod'
import { type as arkType } from 'arktype'

describe('Standard Schema interoperability with third-party libraries', () => {
  describe('Valibot interoperability', () => {
    const valibotSchema = v.object({
      name: v.pipe(v.string(), v.minLength(3)),
      age: v.pipe(v.number(), v.minValue(18)),
    })

    it('should parse valid data from Valibot schema using xanto parse', async () => {
      const data = { name: 'Alex', age: 25 }
      const res = await parse(valibotSchema, data)
      expect(res).toEqual(data)
    })

    it('should throw ValidationError for invalid Valibot schema data', async () => {
      const data = { name: 'Al', age: 16 }
      await expect(parse(valibotSchema, data)).rejects.toThrow(ValidationError)

      try {
        await parse(valibotSchema, data)
      } catch (err) {
        expect(err).toBeInstanceOf(ValidationError)
        if (err instanceof ValidationError) {
          expect(err.issues.length).toBeGreaterThan(0)
          const flat = err.flatten()
          expect(flat.fieldErrors['name']).toBeDefined()
          expect(flat.fieldErrors['age']).toBeDefined()
        }
      }
    })

    it('should work with safeParse on Valibot schema', async () => {
      const valid = await safeParse(valibotSchema, { name: 'Alex', age: 20 })
      expect(valid.success).toBe(true)
      if (valid.success) {
        expect(valid.data).toEqual({ name: 'Alex', age: 20 })
      }

      const invalid = await safeParse(valibotSchema, { name: 'A', age: 10 })
      expect(invalid.success).toBe(false)
      if (!invalid.success) {
        expect(invalid.issues.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Zod interoperability (Standard Schema)', () => {
    const zodSchema = z.object({
      email: z.string().email(),
      count: z.number().int().positive(),
    })

    it('should parse valid data from Zod schema using xanto parse', async () => {
      const data = { email: 'test@xanto.org', count: 5 }
      const res = await parse(zodSchema, data)
      expect(res).toEqual(data)
    })

    it('should throw ValidationError for invalid Zod schema data', async () => {
      const data = { email: 'not-an-email', count: -1 }
      await expect(parse(zodSchema, data)).rejects.toThrow(ValidationError)

      try {
        await parse(zodSchema, data)
      } catch (err) {
        expect(err).toBeInstanceOf(ValidationError)
        if (err instanceof ValidationError) {
          expect(err.getIssuesForPath('email')).toHaveLength(1)
        }
      }
    })

    it('should work with safeParse on Zod schema', async () => {
      const res = await safeParse(zodSchema, { email: 'valid@xanto.org', count: 10 })
      expect(res.success).toBe(true)
      if (res.success) {
        expect(res.data).toEqual({ email: 'valid@xanto.org', count: 10 })
      }
    })
  })

  describe('ArkType interoperability (Standard Schema)', () => {
    const arkSchema = arkType({
      title: 'string >= 2',
      views: 'number >= 0',
    })

    it('should parse valid data from ArkType schema using xanto parse', async () => {
      const data = { title: 'Post Title', views: 100 }
      const res = await parse(arkSchema, data)
      expect(res).toEqual(data)
    })

    it('should throw ValidationError for invalid ArkType schema data', async () => {
      const data = { title: 'P', views: -5 }
      await expect(parse(arkSchema, data)).rejects.toThrow(ValidationError)
    })
  })

  describe('Cross-library nested combination', () => {
    it('should allow embedding third-party Standard Schemas into x.object shape', async () => {
      const zodEmail = z.string().email()
      const valibotName = v.pipe(v.string(), v.minLength(2))

      const compositeSchema = x.object({
        id: x.number().coerce(),
        email: zodEmail,
        name: valibotName,
      })

      const validResult = await parse(compositeSchema, {
        id: '123',
        email: 'user@xanto.org',
        name: 'Alex',
      })

      expect(validResult).toEqual({
        id: 123,
        email: 'user@xanto.org',
        name: 'Alex',
      })

      const invalidResult = await safeParse(compositeSchema, {
        id: '123',
        email: 'bad-email',
        name: 'A',
      })

      expect(invalidResult.success).toBe(false)
      if (!invalidResult.success) {
        expect(invalidResult.issues.length).toBe(2)
      }
    })
  })
})
