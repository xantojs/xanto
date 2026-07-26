import { serve } from 'h3'

export type ServerOptions = Parameters<typeof serve>[1]

export function createServer(h3Instance: any, options: ServerOptions = {}) {
  return serve(h3Instance, {
    port: 3000,
    silent: true,
    ...options,
  })
}
