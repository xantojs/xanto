import { serve } from 'h3'

import type { ServerOptions } from './types/serverOptions.type.js'

export function createServer(h3Instance: any, options: ServerOptions = {}) {
  return serve(h3Instance, {
    port: 3000,
    silent: true,
    ...options,
  })
}
