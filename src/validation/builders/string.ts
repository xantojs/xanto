import {
  string as vString,
  pipe,
  minLength,
  maxLength,
  length as vLength,
  email as vEmail,
  url as vUrl,
  uuid as vUuid,
  regex as vRegex,
  optional as vOptional,
  type BaseSchema,
  type PipeAction,
} from 'valibot'
import { wrapSchema } from '../utils/wrap.util.js'
import type { StringOptions } from '../types/options.type.js'
import type { StandardSchemaV1 } from '../types/schema.type.js'

export function string(options?: StringOptions): StandardSchemaV1<string, string> {
  const actions: PipeAction<string, string, any>[] = []

  if (options?.min !== undefined) {
    actions.push(minLength(options.min, typeof options.message === 'string' ? options.message : undefined))
  }

  if (options?.max !== undefined) {
    actions.push(maxLength(options.max, typeof options.message === 'string' ? options.message : undefined))
  }

  if (options?.length !== undefined) {
    actions.push(vLength(options.length, typeof options.message === 'string' ? options.message : undefined))
  }

  if (options?.email) {
    const msg = typeof options.email === 'string' ? options.email : options.message
    actions.push(vEmail(typeof msg === 'string' ? msg : undefined))
  }

  if (options?.url) {
    const msg = typeof options.url === 'string' ? options.url : options.message
    actions.push(vUrl(typeof msg === 'string' ? msg : undefined))
  }

  if (options?.uuid) {
    const msg = typeof options.uuid === 'string' ? options.uuid : options.message
    actions.push(vUuid(typeof msg === 'string' ? msg : undefined))
  }

  if (options?.regex) {
    actions.push(vRegex(options.regex, typeof options.message === 'string' ? options.message : undefined))
  }

  let schema: BaseSchema<any, any, any> = actions.length > 0 ? (pipe as any)(vString(options?.message), ...actions) : vString(options?.message)

  if (options?.default !== undefined) {
    schema = vOptional(schema, options.default)
  }

  return wrapSchema(schema)
}
