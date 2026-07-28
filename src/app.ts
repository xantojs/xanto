import { H3, type EventHandler } from 'h3'
import { createServer, type ServerOptions } from './server.js'
import { loadFiles } from './router/loader.js'

export interface App {
  start(options?: number | ServerOptions): Promise<ReturnType<typeof createServer>>
}

export interface XantoAppOptions {
  routes?: string
}

export function createApp(appOptions?: XantoAppOptions): App {
  const h3 = new H3()

  const app = {
    async start(serverOptions?: number | ServerOptions) {
      const opts = typeof serverOptions === 'number' ? { port: serverOptions } : serverOptions
      await loadFiles(appOptions?.routes)
      return createServer(h3, opts)
    },
  }

  return app
}
  