import { H3, serve } from 'h3'

import { handleError } from './handlers/error.handler.js'

import type { ParsedRoute } from '../types/route.types.js'
import type { ServerOptions } from './types/serverOptions.types.js'


export function createH3App(routes: ParsedRoute[]): H3 {
  const app = new H3()

  for (const route of routes) {
    const catchAllParam = route.params?.find((p) => p.isCatchAll)?.name

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
