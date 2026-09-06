import { createInitialState, createOptionalMethods, handleOptional } from '../core/state.js'
import { createStandardSchema } from '../core/standard.js'

import type { StandardSchemaV1, InferInput, InferOutput } from '../../types/schema.types.js'
import type { ChainState } from '../types/chainState.types.js'
import type { XantoRecordSchema } from '../types/chain.types.js'

function build<K extends StandardSchemaV1, V extends StandardSchemaV1>(
  keySchema: K,
  valueSchema: V,
  state: ChainState<Record<string, InferOutput<V>>>
): XantoRecordSchema<K, V> {
  const validate = handleOptional<Record<string, InferOutput<V>>>(state, async (value) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return { issues: [{ message: 'Expected a record' }] }
    }

    const record = value as Record<string, unknown>
    const output: Record<string, unknown> = {}
    const issues: { message: string; path?: (string | number)[] }[] = []

    for (const [key, val] of Object.entries(record)) {
      const keyResult = await keySchema['~standard'].validate(key)
      const valueResult = await valueSchema['~standard'].validate(val)

      if ('issues' in keyResult && keyResult.issues) {
        for (const issue of keyResult.issues) {
          issues.push({ message: issue.message, path: [key, ...((issue.path ?? []) as (string | number)[])] })
        }
      }
      if ('issues' in valueResult && valueResult.issues) {
        for (const issue of valueResult.issues) {
          issues.push({ message: issue.message, path: [key, ...((issue.path ?? []) as (string | number)[])] })
        }
      }

      if ('value' in keyResult && 'value' in valueResult) {
        output[keyResult.value as string] = valueResult.value
      }
    }

    if (issues.length > 0) {
      return { issues }
    }

    return { value: output as Record<string, InferOutput<V>> }
  })

  return {
    keySchema,
    valueSchema,
    ...createStandardSchema<Record<string, InferInput<V>>, Record<string, InferOutput<V>>>(validate),
    ...createOptionalMethods(state, (newState) => build(keySchema, valueSchema, newState)),
  }
}

export function record<K extends StandardSchemaV1, V extends StandardSchemaV1>(
  keySchema: K,
  valueSchema: V
): XantoRecordSchema<K, V> {
  return build(keySchema, valueSchema, createInitialState<Record<string, InferOutput<V>>>())
}