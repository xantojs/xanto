import { H3, serve } from 'h3'

import { createRouteMatcher } from './routing/routeMatcher.js'
import { handleError } from './handlers/error.handler.js'

import type { ParsedRoute } from '../types/route.types.js'
import type { ServerOptions } from './types/serverOptions.types.js'

export function createH3App(routes: ParsedRoute[]): H3 {
  const app = new H3()
  const findRoute = createRouteMatcher(routes)

  app.use(async (event, next) => {
    const match = findRoute(event.req.method, event.url.pathname)
    if (!match) return next()

    event.context.params = match.params as any

    try {
      return (await match.route.handler(event)) ?? null
    } catch (err) {
      return handleError(err)
    }
  })

  for (const route of routes) {
    if (route.segments) continue

    const catchAllParam = route.params?.find((param) => param.isCatchAll)?.name

    app.on(route.method, route.path, async (event) => {
      if (catchAllParam && event.context.params) {
        const raw = event.context.params[catchAllParam]

        if (typeof raw === 'string') {
          event.context.params[catchAllParam] = raw.split('/').filter(Boolean) as any
        }
      }

      try {
        return await route.handler(event)
      } catch (err) {
        return handleError(err)
      }
    })
  }

  return app
}

export function createServer(routes: ParsedRoute[], options: ServerOptions = {}) {
  return serve(createH3App(routes), {
    port: 3000,
    silent: true,
    ...options,
  })
}
