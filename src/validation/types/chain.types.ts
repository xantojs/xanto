import type { StandardSchemaV1 } from './schema.types.js'

export interface XantoSchema<Input = unknown, Output = Input> extends StandardSchemaV1<Input, Output> {
  optional(): XantoSchema<Input | undefined, Output | undefined>
  optional<DefaultValue>(defaultValue: DefaultValue): XantoSchema<Input | undefined, Output | DefaultValue>
  default<DefaultValue>(defaultValue: DefaultValue): XantoSchema<Input | undefined, Output | DefaultValue>
}

export type StringFormatMethods = 'email' | 'url' | 'uuid'

export interface XantoStringSchema extends XantoSchema<string, string> {
  min(length: number, message?: string): Omit<XantoStringSchema, 'length'>
  max(length: number, message?: string): Omit<XantoStringSchema, 'length'>
  length(length: number, message?: string): Omit<XantoStringSchema, 'min' | 'max' | 'length'>
  regex(pattern: RegExp, message?: string): XantoStringSchema

  email(message?: string): Omit<XantoStringSchema, StringFormatMethods>
  url(message?: string): Omit<XantoStringSchema, StringFormatMethods>
  uuid(message?: string): Omit<XantoStringSchema, StringFormatMethods | 'min' | 'max' | 'length'>
}

export interface XantoNumberSchema extends XantoSchema<number, number> {
  min(value: number, message?: string): XantoNumberSchema
  max(value: number, message?: string): XantoNumberSchema
  integer(message?: string): Omit<XantoNumberSchema, 'integer'>
  coerce(): Omit<XantoNumberSchema, 'coerce'>
}

export interface XantoBooleanSchema extends XantoSchema<boolean, boolean> {
  coerce(): Omit<XantoBooleanSchema, 'coerce'>
}

export interface XantoArraySchema<ItemInput, ItemOutput> extends XantoSchema<ItemInput[], ItemOutput[]> {
  min(length: number, message?: string): Omit<XantoArraySchema<ItemInput, ItemOutput>, 'length'>
  max(length: number, message?: string): Omit<XantoArraySchema<ItemInput, ItemOutput>, 'length'>
  length(length: number, message?: string): Omit<XantoArraySchema<ItemInput, ItemOutput>, 'min' | 'max' | 'length'>
}
