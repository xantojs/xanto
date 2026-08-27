import type { XantoSchema } from '../types/chain.types.js'
import { createBaseChain } from '../utils/chain.util.js'

export function any(): XantoSchema<any, any> {
  return createBaseChain((value: unknown) => ({ value }))
}

export function unknown(): XantoSchema<unknown, unknown> {
  return createBaseChain((value: unknown) => ({ value }))
}
