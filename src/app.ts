import { H3 } from 'h3'
import { createServer } from './server/server.js'
import { loadFiles } from './scan/loader.js'

import type { ServerOptions } from './server/types/serverOptions.types.js'
import type { App, XantoAppOptions } from './types/app.types.js'
import { validatePath } from './utils/validatePath.util.js'

export function createApp(appOptions?: XantoAppOptions): App {
  if (appOptions?.routesDir) validatePath(appOptions.routesDir)
  if (appOptions?.basePath) validatePath(appOptions.basePath)

  const h3 = new H3()

  const app = {
    async start(serverOptions?: number | ServerOptions) {
      const opts = typeof serverOptions === 'number' ? { port: serverOptions } : serverOptions
      loadFiles(appOptions?.routesDir, appOptions?.basePath)
      return createServer(h3, opts)
    },
  }

  return app
}
