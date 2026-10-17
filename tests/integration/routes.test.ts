import { describe, expect, it } from 'vitest'
import { createTestClient } from './helpers/testClient.js'
import { GET } from '../../src/server/routing/methods.js'
import { x } from '../../src/validation/index.js'
import type { ParsedRoute } from '../../src/types/route.types.js'

describe('Integration: Route matching experiments', () => {
  it('handles basic GET route', async () => {
    const route = GET({
      handler() {
        return 'Hello World'
      },
    })

    const routes: ParsedRoute[] = [
      {
        path: '/hello',
        method: 'GET',
        handler: route.handler,
      },
    ]

    const client = createTestClient(routes)
    const res = await client.get('/hello')

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello World')
  })

  it('handles dynamic params with validation schema', async () => {
    const route = GET({
      schema: {
        params: x.object({
          id: x.number().coerce(),
        }),
      },
      handler(ctx) {
        return { id: ctx.params.id, type: typeof ctx.params.id }
      },
    })

    const routes: ParsedRoute[] = [
      {
        path: '/users/:id',
        method: 'GET',
        schema: route.schema,
        handler: route.handler,
      },
    ]

    const client = createTestClient(routes)

    const valid = await client.get('/users/123')
    expect(valid.status).toBe(200)
    expect(await valid.json()).toEqual({ id: 123, type: 'number' })

    const invalid = await client.get('/users/abc')
    expect(invalid.status).toBe(400)
    const err = await invalid.json<{ message: string; status: number }>()
    expect(err.status).toBe(400)
    expect(err.message).toBe('Validation failed')
  })

  it('handles catch-all array parameter', async () => {
    const route = GET({
      handler(ctx) {
        return { slug: ctx.params.slug }
      },
    })

    const routes: ParsedRoute[] = [
      {
        path: '/docs/**:slug',
        method: 'GET',
        params: [{ name: 'slug', isCatchAll: true }],
        handler: route.handler,
      },
    ]

    const client = createTestClient(routes)
    const res = await client.get('/docs/guide/routing/file-based')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      slug: ['guide', 'routing', 'file-based'],
    })
  })
})
