import { serve } from 'h3'

import type { ServerOptions } from './types/serverOptions.types.js'

export function createServer(h3Instance: any, options: ServerOptions = {}) {
  return serve(h3Instance, {
    port: 3000,
    silent: true,
    ...options,
  })
}
