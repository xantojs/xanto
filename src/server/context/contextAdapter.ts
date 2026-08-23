import { readBody, getCookie, setCookie, deleteCookie, getQuery, redirect, getRequestIP, type H3Event } from 'h3'

import { XantoStateManager } from './stateManager.js'
import type { XantoContext } from '../types/context.types.js'

export async function createContext<TState extends Record<string, unknown>>(
  event: H3Event,
  schema?: any
): Promise<XantoContext<unknown, Record<string, unknown>, Record<string, unknown>, Record<string, string | undefined>, TState>> {
  const rawQuery = getQuery(event)
  const rawHeaders = Object.fromEntries(event.req.headers.entries())
  const rawParams = event.context.params || {}

  let parsedBody: unknown = undefined
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(event.req.method)) {
    try {
      parsedBody = await readBody(event)
    } catch {
      parsedBody = undefined
    }
  }

  const clientIp = getRequestIP(event)
  const state = new XantoStateManager<TState>()

  const ctx: XantoContext<
    unknown,
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, string | undefined>,
    TState
  > = {
    params: Object.freeze(rawParams),
    query: Object.freeze(rawQuery),
    headers: Object.freeze(rawHeaders),
    method: event.req.method as any,
    path: event.url.pathname,
    url: event.url.pathname + event.url.search,
    raw: event,
    state,

    ...(clientIp !== undefined && { ip: clientIp }),
    ...(parsedBody !== undefined && { body: Object.freeze(parsedBody as object) }),

    status(code) {
      event.res.status = code
      return this
    },

    setHeader(name, value) {
      if (Array.isArray(value)) {
        event.res.headers.delete(name)
        for (const item of value) {
          event.res.headers.append(name, String(item))
        }
      } else {
        event.res.headers.set(name, String(value))
      }
      return this
    },

    getHeader(name) {
      return event.req.headers.get(name) ?? undefined
    },

    getCookie(name) {
      return getCookie(event, name)
    },

    setCookie(name, value, options) {
      setCookie(event, name, value, options as any)
      return this
    },

    deleteCookie(name, options) {
      deleteCookie(event, name, options as any)
      return this
    },

    redirect(location, statusCode) {
      redirect(location, statusCode)
    },
  }

  return ctx
}
