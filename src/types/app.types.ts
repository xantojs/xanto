import type { createServer } from '../server/server.js'
import type { ServerOptions } from '../server/types/serverOptions.type.js'

export interface App {
  start(options?: number | ServerOptions): Promise<ReturnType<typeof createServer>>
}

export interface XantoAppOptions {
  basePath?: string
  routesDir?: string
}
