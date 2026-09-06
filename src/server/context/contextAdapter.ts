import { readBody, getCookie, setCookie, deleteCookie, getQuery, redirect, getRequestIP, type H3Event } from 'h3'

import type { StandardSchemaV1 } from '../../types/schema.types.js'
import { XantoStateManager } from './stateManager.js'
import type { XantoContext } from '../types/context.types.js'
import type { RouteSchema } from '../types/routing.types.js'

function getOrCreateState<TState extends Record<string, unknown>>(event: H3Event): XantoStateManager<TState> {
  if (!event.context.__xantoState) {
    event.context.__xantoState = new XantoStateManager<Record<string, unknown>>()
  }
  return event.context.__xantoState as unknown as XantoStateManager<TState>
}

async function validateSchema<T extends StandardSchemaV1>(schema: T, data: unknown): Promise<StandardSchemaV1.InferOutput<T>> {
  const result = await schema['~standard'].validate(data)
  if (result.issues) {
    const message = result.issues.map((i) => i.message).join('; ')
    throw Object.assign(new Error(message), { issues: result.issues })
  }
  return result.value as StandardSchemaV1.InferOutput<T>
}

export async function createContext<TState extends Record<string, unknown>>(
  event: H3Event,
  schema?: RouteSchema
): Promise<XantoContext<unknown, Record<string, unknown>, Record<string, unknown>, Record<string, string | undefined>, TState>> {
  const rawQuery = getQuery(event)
  const rawHeaders = Object.fromEntries(event.req.headers.entries())
  const rawParams = event.context.params || {}

  let rawBody: unknown = undefined
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(event.req.method)) {
    try {
      rawBody = await readBody(event)
    } catch {
      rawBody = undefined
    }
  }

  const bodySchema = (schema as import('../types/routing.types.js').BodyRouteSchema | undefined)?.body
  const state = getOrCreateState<TState>(event)

  const [query, params, headers, body] = await Promise.all([
    schema?.query ? validateSchema(schema.query, rawQuery) : Promise.resolve(rawQuery),
    schema?.params ? validateSchema(schema.params, rawParams) : Promise.resolve(rawParams),
    schema?.headers ? validateSchema(schema.headers, rawHeaders) : Promise.resolve(rawHeaders),
    bodySchema && rawBody !== undefined ? validateSchema(bodySchema, rawBody) : Promise.resolve(rawBody),
  ])

  if (schema?.state) {
    await validateSchema(schema.state, state.entries)
  }

  const clientIp = getRequestIP(event)

  const ctx: XantoContext<
    unknown,
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, string | undefined>,
    TState
  > = {
    params: Object.freeze(params as Record<string, unknown>),
    query: Object.freeze(query as Record<string, unknown>),
    headers: Object.freeze(headers as Record<string, string | undefined>),
    method: event.req.method as any,
    path: event.url.pathname,
    url: event.url.pathname + event.url.search,
    raw: event,
    state,

    ...(clientIp !== undefined && { ip: clientIp }),
    ...(body !== undefined && { body: Object.freeze(body as object) }),

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
