import { describe, expect, it } from 'vitest'
import { buildRoutes } from '../../scan/builder/routeBuilder.js'
import { parseFile } from '../../scan/parser/fileParser.js'
import { createRouteMatcher } from './routeMatcher.js'

function matcherFor(paths: string[]) {
  const files = paths.map((path) => {
    const file = parseFile(`/root/${path}`, path)
    if (!file) throw new Error(`Invalid test route: ${path}`)
    return file
  })

  const routes = buildRoutes(files).map((route) => ({
    path: route.path,
    method: route.method,
    segments: route.segments,
    handler: () => route.path,
  }))

  return createRouteMatcher(routes)
}

describe('createRouteMatcher', () => {
  it('prefers static, then typed, then plain dynamic segments', () => {
    const match = matcherFor(['users/[id]/get.ts', 'users/[id::number]/get.ts', 'users/settings/get.ts'])

    expect(match('GET', '/users/settings')?.route.path).toBe('/users/settings')
    expect(match('GET', '/users/123')?.route.path).toBe('/users/:id(\\d+)')
    expect(match('GET', '/users/abc')?.route.path).toBe('/users/:id')
  })

  it('returns to a less specific branch when the rest of the path does not match', () => {
    const match = matcherFor(['users/settings/details/get.ts', 'users/[name]/profile/get.ts', 'users/[id::number]/edit/get.ts'])

    const result = match('GET', '/users/settings/profile')
    expect(result?.route.path).toBe('/users/:name/profile')
    expect(result?.params).toEqual({ name: 'settings' })

    expect(match('GET', '/users/123/profile')?.route.path).toBe('/users/:name/profile')
    expect(match('GET', '/users/123/edit')?.route.path).toBe('/users/:id(\\d+)/edit')
  })

  it('passes remaining segments to catch-all and leaves unknown paths unmatched', () => {
    const match = matcherFor(['docs/[...slug]/get.ts'])

    const result = match('GET', '/docs/api/v1')
    expect(result?.params).toEqual({ slug: ['api', 'v1'] })

    expect(match('GET', '/unknown')).toBeUndefined()
  })

  it('separates HTTP methods and falls back from HEAD to GET', () => {
    const match = matcherFor(['items/get.ts', 'items/post.ts'])

    expect(match('GET', '/items')?.route.method).toBe('GET')
    expect(match('POST', '/items')?.route.method).toBe('POST')
    expect(match('HEAD', '/items')?.route.method).toBe('GET')
    expect(match('DELETE', '/items')).toBeUndefined()
  })
})
