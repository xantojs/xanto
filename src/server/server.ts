import { H3, serve } from 'h3'

import type { ParsedRoute } from '../types/route.types.js'
import type { ServerOptions } from './types/serverOptions.types.js'


export function createH3App(routes: ParsedRoute[]): H3 {
  const app = new H3()

  for (const route of routes) {
    app.on(route.method, route.path, route.handler)
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
