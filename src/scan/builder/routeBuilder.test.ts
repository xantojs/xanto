import { describe, it, expect } from 'vitest'
import { buildRoutes } from './routeBuilder.js'
import { parseFile } from '../parser/fileParser.js'
import type { DiscoveredFile } from '../types/scan.types.js'

function buildDiscovered(relativePaths: string[]): DiscoveredFile[] {
  return relativePaths.map((rel) => {
    const file = parseFile(`/root/${rel}`, rel)
    if (!file) throw new Error(`Invalid test file: ${rel}`)
    return file
  })
}

describe('buildRoutes', () => {
  it('returns empty array when no route files provided', () => {
    const files = buildDiscovered(['middleware.ts', 'error.ts'])
    const routes = buildRoutes(files)
    expect(routes).toEqual([])
  })

  it('builds root route with correct properties', () => {
    const files = buildDiscovered(['get.ts'])
    const routes = buildRoutes(files)

    expect(routes).toHaveLength(1)
    expect(routes[0]).toEqual({
      path: '/',
      method: 'GET',
      filePath: '/root/get.ts',
      params: [],
      priority: 0,
    })
  })

  it('builds multiple HTTP methods on root route', () => {
    const files = buildDiscovered(['get.ts', 'post.ts', 'delete.ts'])
    const routes = buildRoutes(files)

    expect(routes).toHaveLength(3)
    const methods = routes.map((r) => r.method).sort()
    expect(methods).toEqual(['DELETE', 'GET', 'POST'])
    routes.forEach((r) => {
      expect(r.path).toBe('/')
      expect(r.priority).toBe(0)
    })
  })

  it('builds nested route with dynamic and typed parameters', () => {
    const files = buildDiscovered([
      'users/[id::number]/posts/[slug]/get.ts',
    ])
    const routes = buildRoutes(files)

    expect(routes).toHaveLength(1)
    expect(routes[0]).toEqual({
      path: '/users/:id/posts/:slug',
      method: 'GET',
      filePath: '/root/users/[id::number]/posts/[slug]/get.ts',
      params: [
        { name: 'id', type: 'number', isCatchAll: false },
        { name: 'slug', isCatchAll: false },
      ],
      priority: 4342,
    })
  })

  it('builds route with catch-all parameter and strips group from path', () => {
    const files = buildDiscovered([
      '(admin)/docs/[...slug]/get.ts',
    ])
    const routes = buildRoutes(files)

    expect(routes).toHaveLength(1)
    expect(routes[0]).toEqual({
      path: '/docs/**:slug',
      method: 'GET',
      filePath: '/root/(admin)/docs/[...slug]/get.ts',
      params: [
        { name: 'slug', isCatchAll: true },
      ],
      priority: 41,
    })
  })

  it('handles multiple nested route groups cleanly without polluting path', () => {
    const files = buildDiscovered([
      '(marketing)/(v1)/(public)/pricing/get.ts',
    ])
    const routes = buildRoutes(files)

    expect(routes).toHaveLength(1)
    expect(routes[0]?.path).toBe('/pricing')
    expect(routes[0]?.method).toBe('GET')
    expect(routes[0]?.priority).toBe(4)
  })

  it('cascades middlewares top-down and error handler bubble-up', () => {
    const files = buildDiscovered([
      'middleware.ts',
      'error.ts',
      'users/middleware.ts',
      'users/profile/get.ts',
      'users/profile/error.ts',
      'users/profile/settings/get.ts',
    ])
    const routes = buildRoutes(files)

    const profileRoute = routes.find((r) => r.path === '/users/profile')
    expect(profileRoute).toBeDefined()
    expect(profileRoute?.middlewares).toEqual([
      '/root/middleware.ts',
      '/root/users/middleware.ts',
    ])
    expect(profileRoute?.errorHandler).toBe('/root/users/profile/error.ts')

    const settingsRoute = routes.find((r) => r.path === '/users/profile/settings')
    expect(settingsRoute).toBeDefined()
    expect(settingsRoute?.middlewares).toEqual([
      '/root/middleware.ts',
      '/root/users/middleware.ts',
    ])
    expect(settingsRoute?.errorHandler).toBe('/root/users/profile/error.ts')
  })

  it('isolates middlewares and errors inside route groups', () => {
    const files = buildDiscovered([
      'middleware.ts',
      '(admin)/middleware.ts',
      '(admin)/dashboard/get.ts',
      '(public)/login/get.ts',
    ])
    const routes = buildRoutes(files)

    const dashboard = routes.find((r) => r.path === '/dashboard')
    const login = routes.find((r) => r.path === '/login')

    expect(dashboard?.middlewares).toEqual([
      '/root/middleware.ts',
      '/root/(admin)/middleware.ts',
    ])
    expect(login?.middlewares).toEqual([
      '/root/middleware.ts',
    ])
  })

  it('sorts routes by priority score descending', () => {
    const files = buildDiscovered([
      'users/[...slug]/get.ts',
      'users/[id]/get.ts',
      'users/[id::number]/get.ts',
      'users/settings/get.ts',
    ])
    const routes = buildRoutes(files)

    const paths = routes.map((r) => r.path)
    expect(paths).toEqual([
      '/users/settings',
      '/users/:id',
      '/users/:id',
      '/users/**:slug',
    ])

    expect(routes[0]?.priority).toBeGreaterThan(routes[1]?.priority!)
    expect(routes[1]?.priority).toBeGreaterThan(routes[2]?.priority!)
    expect(routes[2]?.priority).toBeGreaterThan(routes[3]?.priority!)
  })

  it('correctly handles deeply nested complex hierarchies and prefixes', () => {
    const files = buildDiscovered([
      'api/v1/auth/user.login.post.ts',
      'api/v1/users/[userId::uuid]/avatar.get.ts',
      'api/v1/users/[userId::uuid]/delete.delete.ts',
    ])
    const routes = buildRoutes(files)

    expect(routes).toHaveLength(3)

    const login = routes.find((r) => r.method === 'POST')
    expect(login?.path).toBe('/api/v1/auth')
    expect(login?.filePath).toBe('/root/api/v1/auth/user.login.post.ts')

    const avatar = routes.find((r) => r.method === 'GET')
    expect(avatar?.path).toBe('/api/v1/users/:userid')
    expect(avatar?.params).toEqual([{ name: 'userid', type: 'uuid', isCatchAll: false }])

    const del = routes.find((r) => r.method === 'DELETE')
    expect(del?.path).toBe('/api/v1/users/:userid')
    expect(del?.params).toEqual([{ name: 'userid', type: 'uuid', isCatchAll: false }])
  })
})
