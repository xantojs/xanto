import { createInitialState, createOptionalMethods, handleOptional } from '../core/state.js'
import { createStandardSchema } from '../core/standard.js'

import type { ChainState } from '../types/chainState.types.js'
import type { ObjectShape, InferObjectInput, InferObjectOutput, XantoObjectSchema } from '../types/chain.types.js'

export type ObjectMode = 'strip' | 'passthrough' | 'strict'

interface ObjectState<Shape extends ObjectShape> {
  chain: ChainState<InferObjectOutput<Shape>>
  mode: ObjectMode
}

function build<Shape extends ObjectShape>(shape: Shape, state: ObjectState<Shape>): XantoObjectSchema<Shape> {
  const validate = handleOptional<InferObjectOutput<Shape>>(state.chain, async (value) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return {
        issues: [{ message: state.chain.message ?? 'Expected object' }],
      }
    }

    const output: Record<string, unknown> = {}
    const issues: { message: string; path?: (string | number)[] }[] = []
    const record = value as Record<string, unknown>
    const shapeKeys = Object.keys(shape)

    for (const [key, fieldSchema] of Object.entries(shape)) {
      const val = record[key]
      const fieldResult = await fieldSchema['~standard'].validate(val)

      if ('issues' in fieldResult && fieldResult.issues) {
        for (const issue of fieldResult.issues) {
          issues.push({
            message: issue.message,
            path: [key, ...((issue.path ?? []) as (string | number)[])],
          })
        }
      } else if ('value' in fieldResult) {
        output[key] = fieldResult.value
      }
    }

    const extraKeys = Object.keys(record).filter((key) => !shapeKeys.includes(key))
    if (extraKeys.length > 0) {
      if (state.mode === 'strict') {
        for (const key of extraKeys) {
          issues.push({ message: `Unexpected key "${key}"`, path: [key] })
        }
      } else if (state.mode === 'passthrough') {
        for (const key of extraKeys) {
          output[key] = record[key]
        }
      }
    }

    if (issues.length > 0) {
      return { issues }
    }

    return { value: output as unknown as InferObjectOutput<Shape> }
  })

  return {
    shape,
    ...createStandardSchema<InferObjectInput<Shape>, InferObjectOutput<Shape>>(validate),

    strip: () => build(shape, { chain: state.chain, mode: 'strip' }),
    passthrough: () => build(shape, { chain: state.chain, mode: 'passthrough' }),
    strict: () => build(shape, { chain: state.chain, mode: 'strict' }),

    ...createOptionalMethods(state.chain, (newChain) => build(shape, { chain: newChain, mode: state.mode })),
  }
}

export function object<Shape extends ObjectShape>(shape: Shape, message?: string): XantoObjectSchema<Shape> {
  return build(shape, { chain: createInitialState(message), mode: 'strip' })
}
