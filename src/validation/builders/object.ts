import { createInitialState, createOptionalMethods, handleOptional } from '../core/state.js'
import { createStandardSchema } from '../core/standard.js'
import type { StandardIssue, StandardResult } from '../../types/schema.types.js'

import type { ChainState } from '../types/chainState.types.js'
import type { ObjectShape, InferObjectInput, InferObjectOutput, XantoObjectSchema, ObjectMode } from '../types/chain.types.js'

interface ObjectState<Shape extends ObjectShape> {
  chain: ChainState<InferObjectOutput<Shape>>
  mode: ObjectMode
}

function build<Shape extends ObjectShape>(shape: Shape, state: ObjectState<Shape>): XantoObjectSchema<Shape> {
  type Output = InferObjectOutput<Shape>

  const validate = handleOptional<Output>(state.chain, (value) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return {
        issues: [{ message: state.chain.message ?? 'Expected object' }],
      }
    }

    const record = value as Record<string, unknown>
    const output: Record<string, unknown> = {}
    const issues: StandardIssue[] = []
    const fields = Object.entries(shape)
    const shapeKeys = state.mode === 'strip' ? undefined : new Set(fields.map(([key]) => key))

    function writeField(key: string, value: unknown): void {
      if (key === '__proto__') {
        Object.defineProperty(output, key, {
          value,
          enumerable: true,
          writable: true,
          configurable: true,
        })
      } else {
        output[key] = value
      }
    }

    function collectFieldResult(key: string, result: StandardResult<unknown>): void {
      if (result.issues) {
        for (const issue of result.issues) {
          issues.push({
            message: issue.message,
            path: [key, ...(issue.path ?? [])],
          })
        }
      } else {
        writeField(key, result.value)
      }
    }

    function validateFields(start: number): StandardResult<Output> | Promise<StandardResult<Output>> {
      for (let index = start; index < fields.length; index++) {
        const [key, fieldSchema] = fields[index]!
        const input = Object.hasOwn(record, key) ? record[key] : undefined
        const result = fieldSchema['~standard'].validate(input)

        if ('then' in result) {
          return Promise.resolve(result).then((resolved) => {
            collectFieldResult(key, resolved)
            return validateFields(index + 1)
          })
        }

        collectFieldResult(key, result)
      }

      if (shapeKeys) {
        for (const key of Object.keys(record)) {
          if (shapeKeys.has(key)) continue

          if (state.mode === 'strict') {
            issues.push({ message: `Unexpected key "${key}"`, path: [key] })
          } else {
            writeField(key, record[key])
          }
        }
      }

      if (issues.length > 0) {
        return { issues }
      }

      return { value: output as Output }
    }

    return validateFields(0)
  })

  return {
    shape,
    ...createStandardSchema<InferObjectInput<Shape>, Output>(validate),

    strip: () => build(shape, { chain: state.chain, mode: 'strip' }),
    passthrough: () => build(shape, { chain: state.chain, mode: 'passthrough' }),
    strict: () => build(shape, { chain: state.chain, mode: 'strict' }),

    ...createOptionalMethods(state.chain, (newChain) => build(shape, { chain: newChain, mode: state.mode })),
  }
}

export function object<Shape extends ObjectShape>(shape: Shape, message?: string): XantoObjectSchema<Shape> {
  return build(shape, { chain: createInitialState(message), mode: 'strip' })
}
