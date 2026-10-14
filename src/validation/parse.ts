import type { StandardSchemaV1, InferOutput } from '../types/schema.types.js'
import { ValidationError } from './errors/index.js'

export async function safeParse<T extends StandardSchemaV1>(schema: T, data: unknown) {
  const res = await schema['~standard'].validate(data)

  if (res.issues) {
    return { success: false, issues: res.issues } as const
  }

  return { success: true, data: res.value as InferOutput<T> } as const
}

export async function parse<T extends StandardSchemaV1>(schema: T, data: unknown) {
  const res = await schema['~standard'].validate(data)

  if (res.issues) {
    throw new ValidationError(res.issues)
  }

  return res.value as InferOutput<T>
}
