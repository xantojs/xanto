import { H3, type EventHandler } from 'h3'
import { createServer, type ServerOptions } from './server.js'

export interface App {
  get(path: string, handler: EventHandler): App
  post(path: string, handler: EventHandler): App
  put(path: string, handler: EventHandler): App
  delete(path: string, handler: EventHandler): App

  use(...args: Parameters<H3['use']>): App

  start(options?: number | ServerOptions): ReturnType<typeof createServer>
}

export function createApp(): App {
  const h3 = new H3()

  const app = {
    get(path: string, handler: EventHandler) {
      h3.get(path, handler)
      return app
    },

    post(path: string, handler: EventHandler) {
      h3.post(path, handler)
      return app
    },

    put(path: string, handler: EventHandler) {
      h3.put(path, handler)
      return app
    },

    delete(path: string, handler: EventHandler) {
      h3.delete(path, handler)
      return app
    },

    use(...args: Parameters<H3['use']>) {
      h3.use(...args)
      return app
    },

    start(options?: number | ServerOptions) {
      const opts = typeof options === 'number' ? { port: options } : options
      return createServer(h3, opts)
    },
  }

  return app
}
