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
      path: '/docs/**',
      method: 'GET',
      filePath: '/root/(admin)/docs/[...slug]/get.ts',
      params: [
        { name: 'slug', isCatchAll: true },
      ],
      priority: 41,
    })
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
      '/users/**',
    ])

    expect(routes[0]?.priority).toBeGreaterThan(routes[1]?.priority!)
    expect(routes[1]?.priority).toBeGreaterThan(routes[2]?.priority!)
    expect(routes[2]?.priority).toBeGreaterThan(routes[3]?.priority!)
  })
})
