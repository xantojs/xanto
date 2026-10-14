import { describe, it, expect } from 'vitest'
import { parseFilename } from './filenameParser.js'

describe('parseFilename', () => {
  it('parses standard method routes', () => {
    expect(parseFilename('get.ts')).toEqual({
      raw: 'get.ts',
      kind: 'route',
      method: 'GET',
    })
    expect(parseFilename('post.js')).toEqual({
      raw: 'post.js',
      kind: 'route',
      method: 'POST',
    })
    expect(parseFilename('delete.mts')).toEqual({
      raw: 'delete.mts',
      kind: 'route',
      method: 'DELETE',
    })
    expect(parseFilename('patch.mjs')).toEqual({
      raw: 'patch.mjs',
      kind: 'route',
      method: 'PATCH',
    })
    expect(parseFilename('GET.TS')).toEqual({
      raw: 'GET.TS',
      kind: 'route',
      method: 'GET',
    })
  })

  it('parses routes with custom prefix', () => {
    expect(parseFilename('user.get.ts')).toEqual({
      raw: 'user.get.ts',
      kind: 'route',
      method: 'GET',
      prefix: 'user',
    })
    expect(parseFilename('create-user.post.js')).toEqual({
      raw: 'create-user.post.js',
      kind: 'route',
      method: 'POST',
      prefix: 'create-user',
    })
    expect(parseFilename('item.details.get.ts')).toEqual({
      raw: 'item.details.get.ts',
      kind: 'route',
      method: 'GET',
      prefix: 'item.details',
    })
    expect(parseFilename('item.user.detail.get.ts')).toEqual({
      raw: 'item.user.detail.get.ts',
      kind: 'route',
      method: 'GET',
      prefix: 'item.user.detail',
    })
  })

  it('parses middleware files', () => {
    expect(parseFilename('middleware.ts')).toEqual({
      raw: 'middleware.ts',
      kind: 'middleware',
    })
    expect(parseFilename('auth.middleware.ts')).toEqual({
      raw: 'auth.middleware.ts',
      kind: 'middleware',
      prefix: 'auth',
    })
    expect(parseFilename('session.guard.middleware.js')).toEqual({
      raw: 'session.guard.middleware.js',
      kind: 'middleware',
      prefix: 'session.guard',
    })
  })

  it('parses error files', () => {
    expect(parseFilename('error.ts')).toEqual({
      raw: 'error.ts',
      kind: 'error',
    })
    expect(parseFilename('validation.error.ts')).toEqual({
      raw: 'validation.error.ts',
      kind: 'error',
      prefix: 'validation',
    })
  })

  it('ignores unsupported extensions or private/invalid files', () => {
    expect(parseFilename('service.ts')).toBeNull()
    expect(parseFilename('types.d.ts')).toBeNull()
    expect(parseFilename('schema.validator.ts')).toBeNull()
    expect(parseFilename('get.txt')).toBeNull()
    expect(parseFilename('.get.ts')).toBeNull()
    expect(parseFilename('.middleware.ts')).toBeNull()
    expect(parseFilename('.error.ts')).toBeNull()
    expect(parseFilename('')).toBeNull()
  })
})
