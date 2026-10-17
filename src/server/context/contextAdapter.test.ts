import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'

// h3
vi.mock('h3', () => ({
  getQuery: vi.fn(),
  getRequestIP: vi.fn(),
  readBody: vi.fn(),
  getCookie: vi.fn(),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
  redirect: vi.fn(),
}))

import * as h3Mocks from 'h3'
import { createContext } from './contextAdapter.js'
import { x } from '../../validation/index.js'

//helpers
function makeEvent(overrides?: {
  method?: string
  url?: string
  headers?: Record<string, string>
  params?: Record<string, string>
  xantoState?: any
}): H3Event {
  const {
    method = 'GET',
    url = '/test',
    headers = {},
    params = {},
    xantoState = undefined,
  } = overrides ?? {}

  const parsedUrl = new URL(`http://localhost${url}`)

  return {
    req: {
      method,
      headers: {
        get: (k: string) => headers[k] ?? null,
        entries: () => Object.entries(headers),
      },
    },
    res: {
      status: 200,
      headers: {
        set: vi.fn(),
        delete: vi.fn(),
        append: vi.fn(),
      },
    },
    url: parsedUrl,
    context: {
      params,
      ...(xantoState !== undefined && { __xantoState: xantoState }),
    },
  } as unknown as H3Event
}

// tests
describe('createContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(h3Mocks.getQuery).mockReturnValue({} as any)
    vi.mocked(h3Mocks.getRequestIP).mockReturnValue(undefined)
    vi.mocked(h3Mocks.readBody).mockResolvedValue(undefined)
  })

  // Basic fields

  it('sets path from event.url.pathname', async () => {
    const event = makeEvent({ url: '/hello/world' })
    const ctx = await createContext(event)
    expect(ctx.path).toBe('/hello/world')
  })

  it('sets url as pathname + search', async () => {
    const event = makeEvent({ url: '/hello?q=1' })
    const ctx = await createContext(event)
    expect(ctx.url).toBe('/hello?q=1')
  })

  it('sets method from event.req.method', async () => {
    const event = makeEvent({ method: 'DELETE' })
    const ctx = await createContext(event)
    expect(ctx.method).toBe('DELETE')
  })

  it('sets raw to the original event', async () => {
    const event = makeEvent()
    const ctx = await createContext(event)
    expect(ctx.raw).toBe(event)
  })

  it('sets ip when getRequestIP returns a value', async () => {
    vi.mocked(h3Mocks.getRequestIP).mockReturnValue('192.168.1.1')
    const event = makeEvent()
    const ctx = await createContext(event)
    expect(ctx.ip).toBe('192.168.1.1')
  })

  it('does not set ip when getRequestIP returns undefined', async () => {
    vi.mocked(h3Mocks.getRequestIP).mockReturnValue(undefined)
    const event = makeEvent()
    const ctx = await createContext(event)
    expect(ctx.ip).toBeUndefined()
  })

  it('exposes query from getQuery', async () => {
    vi.mocked(h3Mocks.getQuery).mockReturnValue({ page: '2', limit: '10' } as any)
    const ctx = await createContext(makeEvent())
    expect(ctx.query).toEqual({ page: '2', limit: '10' })
  })

  it('exposes params from event.context.params', async () => {
    const event = makeEvent({ params: { id: '42' } })
    const ctx = await createContext(event)
    expect(ctx.params).toEqual({ id: '42' })
  })

  it('exposes headers from event.req.headers', async () => {
    const event = makeEvent({ headers: { 'x-request-id': 'abc', authorization: 'Bearer token' } })
    const ctx = await createContext(event)
    expect(ctx.headers['x-request-id']).toBe('abc')
    expect(ctx.headers['authorization']).toBe('Bearer token')
  })

  it('query is frozen', async () => {
    vi.mocked(h3Mocks.getQuery).mockReturnValue({ a: '1' } as any)
    const ctx = await createContext(makeEvent())
    expect(Object.isFrozen(ctx.query)).toBe(true)
  })

  it('params is frozen', async () => {
    const ctx = await createContext(makeEvent({ params: { id: '1' } }))
    expect(Object.isFrozen(ctx.params)).toBe(true)
  })

  it('headers is frozen', async () => {
    const ctx = await createContext(makeEvent({ headers: { 'x-foo': 'bar' } }))
    expect(Object.isFrozen(ctx.headers)).toBe(true)
  })

  // Body parsing

  it('reads body for POST', async () => {
    vi.mocked(h3Mocks.readBody).mockResolvedValue({ name: 'Alice' })
    const event = makeEvent({ method: 'POST' })
    const ctx = await createContext(event)
    expect((ctx as any).body).toEqual({ name: 'Alice' })
  })

  it('reads body for PUT', async () => {
    vi.mocked(h3Mocks.readBody).mockResolvedValue({ value: 1 })
    const ctx = await createContext(makeEvent({ method: 'PUT' }))
    expect((ctx as any).body).toEqual({ value: 1 })
  })

  it('reads body for PATCH', async () => {
    vi.mocked(h3Mocks.readBody).mockResolvedValue({ patch: true })
    const ctx = await createContext(makeEvent({ method: 'PATCH' }))
    expect((ctx as any).body).toEqual({ patch: true })
  })

  it('reads body for DELETE', async () => {
    vi.mocked(h3Mocks.readBody).mockResolvedValue({ id: 5 })
    const ctx = await createContext(makeEvent({ method: 'DELETE' }))
    expect((ctx as any).body).toEqual({ id: 5 })
  })

  it('does not read body for GET', async () => {
    await createContext(makeEvent({ method: 'GET' }))
    expect(h3Mocks.readBody).not.toHaveBeenCalled()
  })

  it('does not read body for HEAD', async () => {
    await createContext(makeEvent({ method: 'HEAD' }))
    expect(h3Mocks.readBody).not.toHaveBeenCalled()
  })

  it('does not read body for OPTIONS', async () => {
    await createContext(makeEvent({ method: 'OPTIONS' }))
    expect(h3Mocks.readBody).not.toHaveBeenCalled()
  })

  it('body is undefined on ctx when readBody throws', async () => {
    vi.mocked(h3Mocks.readBody).mockRejectedValue(new Error('parse error'))
    const ctx = await createContext(makeEvent({ method: 'POST' }))
    expect((ctx as any).body).toBeUndefined()
  })

  it('body is frozen when present', async () => {
    vi.mocked(h3Mocks.readBody).mockResolvedValue({ x: 1 })
    const ctx = await createContext(makeEvent({ method: 'POST' }))
    expect(Object.isFrozen((ctx as any).body)).toBe(true)
  })

  it('body is not set on ctx when method is GET even if readBody mock resolves', async () => {
    const ctx = await createContext(makeEvent({ method: 'GET' }))
    expect('body' in ctx).toBe(false)
  })

  //  Schema validation - query

  it('passes raw query through when no schema.query', async () => {
    vi.mocked(h3Mocks.getQuery).mockReturnValue({ raw: 'yes' } as any)
    const ctx = await createContext(makeEvent())
    expect((ctx.query as any).raw).toBe('yes')
  })

  it('validates and coerces query via schema.query', async () => {
    vi.mocked(h3Mocks.getQuery).mockReturnValue({ id: '7' } as any)
    const ctx = await createContext(makeEvent(), {
      query: x.object({ id: x.number().coerce() }),
    })
    expect((ctx.query as any).id).toBe(7)
  })

  it('throws on invalid query', async () => {
    vi.mocked(h3Mocks.getQuery).mockReturnValue({ id: 'not-a-number' } as any)
    await expect(
      createContext(makeEvent(), { query: x.object({ id: x.number() }) })
    ).rejects.toThrow()
  })

  it('error from invalid query has issues array', async () => {
    vi.mocked(h3Mocks.getQuery).mockReturnValue({} as any)
    const err = await createContext(makeEvent(), {
      query: x.object({ required: x.string() }),
    }).catch((e) => e)
    expect(err.issues).toBeDefined()
    expect(Array.isArray(err.issues)).toBe(true)
  })

  // Schema validation - params

  it('validates params via schema.params', async () => {
    const event = makeEvent({ params: { id: '99' } })
    const ctx = await createContext(event, {
      params: x.object({ id: x.string() }),
    })
    expect((ctx.params as any).id).toBe('99')
  })

  it('throws on invalid params', async () => {
    const event = makeEvent({ params: { id: '99' } })
    await expect(
      createContext(event, { params: x.object({ id: x.number() }) })
    ).rejects.toThrow()
  })

  //  Schema validation - headers

  it('validates headers via schema.headers', async () => {
    const event = makeEvent({ headers: { 'x-api-key': 'secret' } })
    const ctx = await createContext(event, {
      headers: x.object({ 'x-api-key': x.string() }),
    })
    expect((ctx.headers as any)['x-api-key']).toBe('secret')
  })

  it('throws on missing required header', async () => {
    const event = makeEvent({ headers: {} })
    await expect(
      createContext(event, { headers: x.object({ 'x-api-key': x.string() }) })
    ).rejects.toThrow()
  })

  //  Schema validation - body

  it('validates body via schema.body', async () => {
    vi.mocked(h3Mocks.readBody).mockResolvedValue({ name: 'Bob', age: 30 })
    const ctx = await createContext(makeEvent({ method: 'POST' }), {
      body: x.object({ name: x.string(), age: x.number() }),
    } as any)
    expect((ctx as any).body).toEqual({ name: 'Bob', age: 30 })
  })

  it('throws on invalid body', async () => {
    vi.mocked(h3Mocks.readBody).mockResolvedValue({ name: 123 })
    await expect(
      createContext(makeEvent({ method: 'POST' }), {
        body: x.object({ name: x.string() }),
      } as any)
    ).rejects.toThrow()
  })

  it('skips body schema validation when body is undefined (GET)', async () => {
    await expect(
      createContext(makeEvent({ method: 'GET' }), {
        body: x.object({ name: x.string() }),
      } as any)
    ).resolves.toBeDefined()
  })

  //  Schema validation - state

  it('validates state.entries against schema.state', async () => {
    /* // TODO(0.2.0): state
    const { XantoStateManager } = await import('./stateManager.js')
    const st = new XantoStateManager<{ role: string }>()
    st.set('role', 'admin')

    const ctx = await createContext<{ role: string }>(makeEvent({ xantoState: st }), {
      state: x.object({ role: x.string() }),
    })
    expect(ctx.state.get('role')).toBe('admin')
    */
  })

  /* // TODO(0.2.0): state
  it('throws when state does not satisfy schema.state', async () => {
    const { XantoStateManager } = await import('./stateManager.js')
    const st = new XantoStateManager<Record<string, unknown>>()

    await expect(
      createContext(makeEvent({ xantoState: st }), {
        state: x.object({ role: x.string() }),
      })
    ).rejects.toThrow()
  })

  it('skips state validation when no schema.state provided', async () => {
    const event = makeEvent()
    await expect(createContext(event)).resolves.toBeDefined()
  })

  // State - per-request isolation

  it('reuses __xantoState set by middleware', async () => {
    const { XantoStateManager } = await import('./stateManager.js')
    const st = new XantoStateManager<{ userId: number }>()
    st.set('userId', 42)

    const ctx = await createContext<{ userId: number }>(makeEvent({ xantoState: st }))
    expect(ctx.state.get('userId')).toBe(42)
  })

  it('creates a fresh state when event has no __xantoState', async () => {
    const ctx = await createContext(makeEvent())
    expect(ctx.state.entries).toEqual({})
  })

  it('two separate events get independent state instances', async () => {
    const ctx1 = await createContext(makeEvent())
    const ctx2 = await createContext(makeEvent())
    ctx1.state.set('x' as any, 1)
    expect(ctx2.state.get('x' as any)).toBeUndefined()
  })

  it('same event reuses the same state instance on second createContext call', async () => {
    const event = makeEvent()
    const ctx1 = await createContext(event)
    ctx1.state.set('k' as any, 'v')
    const ctx2 = await createContext(event)
    expect(ctx2.state.get('k' as any)).toBe('v')
  })
  */

  //  status()

  it('status() sets event.res.status', async () => {
    const event = makeEvent()
    const ctx = await createContext(event)
    ctx.status(201)
    expect(event.res.status).toBe(201)
  })

  it('status() returns ctx for chaining', async () => {
    const ctx = await createContext(makeEvent())
    expect(ctx.status(200)).toBe(ctx)
  })

  // setHeader() 

  it('setHeader() with string value calls res.headers.set', async () => {
    const event = makeEvent()
    const ctx = await createContext(event)
    ctx.setHeader('content-type', 'application/json')
    expect(event.res.headers.set).toHaveBeenCalledWith('content-type', 'application/json')
  })

  it('setHeader() with number value coerces to string', async () => {
    const event = makeEvent()
    const ctx = await createContext(event)
    ctx.setHeader('x-count', 5)
    expect(event.res.headers.set).toHaveBeenCalledWith('x-count', '5')
  })

  it('setHeader() with array deletes then appends each value', async () => {
    const event = makeEvent()
    const ctx = await createContext(event)
    ctx.setHeader('set-cookie', ['a=1', 'b=2'])
    expect(event.res.headers.delete).toHaveBeenCalledWith('set-cookie')
    expect(event.res.headers.append).toHaveBeenCalledWith('set-cookie', 'a=1')
    expect(event.res.headers.append).toHaveBeenCalledWith('set-cookie', 'b=2')
  })

  it('setHeader() returns ctx for chaining', async () => {
    const ctx = await createContext(makeEvent())
    expect(ctx.setHeader('x-a', '1')).toBe(ctx)
  })

  // getHeader() 

  it('getHeader() returns header value from request', async () => {
    const event = makeEvent({ headers: { 'x-token': 'xyz' } })
    const ctx = await createContext(event)
    expect(ctx.getHeader('x-token')).toBe('xyz')
  })

  it('getHeader() returns undefined for missing header', async () => {
    const ctx = await createContext(makeEvent())
    expect(ctx.getHeader('x-missing')).toBeUndefined()
  })

  // getCookie() 

  it('getCookie() delegates to h3 getCookie', async () => {
    vi.mocked(h3Mocks.getCookie).mockReturnValue('session-value')
    const event = makeEvent()
    const ctx = await createContext(event)
    const value = ctx.getCookie('session')
    expect(h3Mocks.getCookie).toHaveBeenCalledWith(event, 'session')
    expect(value).toBe('session-value')
  })

  it('getCookie() returns undefined when cookie not found', async () => {
    vi.mocked(h3Mocks.getCookie).mockReturnValue(undefined)
    const ctx = await createContext(makeEvent())
    expect(ctx.getCookie('missing')).toBeUndefined()
  })

  // setCookie() 

  it('setCookie() delegates to h3 setCookie', async () => {
    const event = makeEvent()
    const ctx = await createContext(event)
    ctx.setCookie('token', 'abc', { httpOnly: true })
    expect(h3Mocks.setCookie).toHaveBeenCalledWith(event, 'token', 'abc', { httpOnly: true })
  })

  it('setCookie() returns ctx for chaining', async () => {
    const ctx = await createContext(makeEvent())
    expect(ctx.setCookie('a', 'b')).toBe(ctx)
  })

  // deleteCookie() 

  it('deleteCookie() delegates to h3 deleteCookie', async () => {
    const event = makeEvent()
    const ctx = await createContext(event)
    ctx.deleteCookie('token')
    expect(h3Mocks.deleteCookie).toHaveBeenCalledWith(event, 'token', undefined)
  })

  it('deleteCookie() returns ctx for chaining', async () => {
    const ctx = await createContext(makeEvent())
    expect(ctx.deleteCookie('x')).toBe(ctx)
  })

  // redirect() 

  it('redirect() delegates to h3 redirect', async () => {
    const ctx = await createContext(makeEvent())
    ctx.redirect('/login', 302)
    expect(h3Mocks.redirect).toHaveBeenCalledWith('/login', 302)
  })

  it('redirect() works without statusCode', async () => {
    const ctx = await createContext(makeEvent())
    ctx.redirect('/home')
    expect(h3Mocks.redirect).toHaveBeenCalledWith('/home', undefined)
  })

  //chaining

  it('status().setHeader().setCookie() chain works', async () => {
    const event = makeEvent()
    const ctx = await createContext(event)
    const result = ctx.status(200).setHeader('x-ok', '1').setCookie('s', 'v')
    expect(result).toBe(ctx)
    expect(event.res.status).toBe(200)
  })
})
