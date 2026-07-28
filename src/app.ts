import { H3 } from 'h3'
import { createServer } from './server.js'
import { loadFiles } from './router/loader.js'

import type { ServerOptions } from './types/serverOptions.type.js'
import type { App, XantoAppOptions } from './types/app.types.js'
import { validatePath } from './utils/validatePath.util.js'

export function createApp(appOptions?: XantoAppOptions): App {
  if (appOptions?.routesDir) validatePath(appOptions.routesDir)
  if (appOptions?.basePath) validatePath(appOptions.basePath)

  const h3 = new H3()

  const app = {
    async start(serverOptions?: number | ServerOptions) {
      const opts = typeof serverOptions === 'number' ? { port: serverOptions } : serverOptions
      await loadFiles(appOptions?.routesDir, appOptions?.basePath)
      return createServer(h3, opts)
    },
  }

  return app
}

