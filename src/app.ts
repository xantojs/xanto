import { H3, type EventHandler } from 'h3'
import { createServer, type ServerOptions } from './server.js'
import { loadFiles } from './router/loader.js'

export interface App {
  start(options?: number | ServerOptions): Promise<ReturnType<typeof createServer>>
}

export function createApp(): App {
  const h3 = new H3()

  const app = {
    async start(options?: number | ServerOptions) {
      const opts = typeof options === 'number' ? { port: options } : options
      await loadFiles()
      return createServer(h3, opts)
    },
  }

  return app
}
