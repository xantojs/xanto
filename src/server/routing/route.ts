import type { Methods } from '../../types/methods.type.js'
import type { Route, RouteSchema } from '../types/routing.types.js'
import { createContext } from '../context/contextAdapter.js'

export function createRoute(method: Methods, options: { schema?: RouteSchema; handler: (ctx: any) => any }): Route {
  return {
    method,
    schema: options.schema,
    async handler(event) {
      const ctx = await createContext(event, options.schema)
      return options.handler(ctx)
    },
  }
}
