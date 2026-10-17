import { describe, it, expect } from 'vitest'
import { H3 } from 'h3'

async function get(app: H3, path: string) {
  const res = await app.fetch(new Request(`http://localhost${path}`))
  return { status: res.status, body: await res.text() }
}

describe('typed param fallback', () => {
  for (const order of ['regex-first', 'name-first'] as const) {
    it(`falls back to :name (${order})`, async () => {
      const app = new H3()
      const regex = () => app.get('/users/:id(\\d+)', () => 'number')
      const name = () => app.get('/users/:name', () => 'string')
      order === 'regex-first' ? (regex(), name()) : (name(), regex())

      expect(await get(app, '/users/123')).toEqual({ status: 200, body: 'number' })
      expect(await get(app, '/users/maxim')).toEqual({ status: 200, body: 'string' })
    })
  }
})