import { createServer } from '../server.js'

import type { ServerOptions } from './serverOptions.type.js'

export interface App {
  start(options?: number | ServerOptions): Promise<ReturnType<typeof createServer>>
}

export interface XantoAppOptions {
  basePath?: string
  routesDir?: string
}
