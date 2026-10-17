import { describe, it, expect } from 'vitest'
import { parseFile } from './fileParser.js'

describe('parseFile', () => {
  it('parses root route file', () => {
    const res = parseFile('/app/routes/get.ts', 'get.ts')
    expect(res).toEqual({
      filePath: '/app/routes/get.ts',
      relativePath: 'get.ts',
      filename: {
        raw: 'get.ts',
        kind: 'route',
        method: 'GET',
      },
      segments: [],
    })
  })

  it('parses nested route with static, dynamic and typed segments', () => {
    const res = parseFile(
      '/app/routes/users/[id::number]/posts/[slug]/get.ts',
      'users/[id::number]/posts/[slug]/get.ts'
    )
    expect(res).toEqual({
      filePath: '/app/routes/users/[id::number]/posts/[slug]/get.ts',
      relativePath: 'users/[id::number]/posts/[slug]/get.ts',
      filename: {
        raw: 'get.ts',
        kind: 'route',
        method: 'GET',
      },
      segments: [
        { raw: 'users', type: 'static', value: 'users' },
        { raw: '[id::number]', type: 'typed-dynamic', value: ':id', paramName: 'id', paramType: 'number' },
        { raw: 'posts', type: 'static', value: 'posts' },
        { raw: '[slug]', type: 'dynamic', value: ':slug', paramName: 'slug' },
      ],
    })
  })

  it('parses route group and catch-all segments', () => {
    const res = parseFile(
      '/app/routes/(admin)/docs/[...slug]/user.get.ts',
      '(admin)/docs/[...slug]/user.get.ts'
    )
    expect(res).toEqual({
      filePath: '/app/routes/(admin)/docs/[...slug]/user.get.ts',
      relativePath: '(admin)/docs/[...slug]/user.get.ts',
      filename: {
        raw: 'user.get.ts',
        kind: 'route',
        method: 'GET',
        prefix: 'user',
      },
      segments: [
        { raw: '(admin)', type: 'group', value: null },
        { raw: 'docs', type: 'static', value: 'docs' },
        { raw: '[...slug]', type: 'catch-all', value: '**:slug', paramName: 'slug' },
      ],
    })
  })

  it('parses middleware and error files with relative path normalization', () => {
    const mw = parseFile('/app/routes//users/auth.middleware.ts', '/users/auth.middleware.ts/')
    expect(mw).toEqual({
      filePath: '/app/routes//users/auth.middleware.ts',
      relativePath: 'users/auth.middleware.ts',
      filename: {
        raw: 'auth.middleware.ts',
        kind: 'middleware',
        prefix: 'auth',
      },
      segments: [{ raw: 'users', type: 'static', value: 'users' }],
    })

    const err = parseFile('/app/routes/error.ts', 'error.ts')
    expect(err).toEqual({
      filePath: '/app/routes/error.ts',
      relativePath: 'error.ts',
      filename: {
        raw: 'error.ts',
        kind: 'error',
      },
      segments: [],
    })
  })

  it('returns null for non-routable or invalid files', () => {
    expect(parseFile('/app/routes/service.ts', 'service.ts')).toBeNull()
    expect(parseFile('/app/routes/types.d.ts', 'types.d.ts')).toBeNull()
    expect(parseFile('/app/routes', '')).toBeNull()
  })
})
