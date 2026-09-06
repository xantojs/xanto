import { createInitialState, createOptionalMethods, handleOptional } from '../core/state.js'
import { createStandardSchema } from '../core/standard.js'

import type { ChainState } from '../types/chainState.types.js'
import type { ObjectShape, InferObjectInput, InferObjectOutput, XantoObjectSchema } from '../types/chain.types.js'

function build<Shape extends ObjectShape>(shape: Shape, state: ChainState<InferObjectOutput<Shape>>): XantoObjectSchema<Shape> {
  const validate = handleOptional<InferObjectOutput<Shape>>(state, async (value) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return {
        issues: [{ message: state.message ?? 'Expected object' }],
      }
    }

    const output: Record<string, unknown> = {}
    const issues: { message: string; path?: (string | number)[] }[] = []
    const record = value as Record<string, unknown>

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

    if (issues.length > 0) {
      return { issues }
    }

    return { value: output as unknown as InferObjectOutput<Shape> }
  })

  return {
    shape,
    ...createStandardSchema<InferObjectInput<Shape>, InferObjectOutput<Shape>>(validate),
    ...createOptionalMethods(state, (newState) => build(shape, newState)),
  }
}

export function object<Shape extends ObjectShape>(shape: Shape, message?: string): XantoObjectSchema<Shape> {
  return build(shape, createInitialState(message))
}
