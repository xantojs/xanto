import type { StandardSchemaV1, InferInput, InferOutput } from '../../types/schema.types.js'

export interface XantoSchema<Input = unknown, Output = Input> extends StandardSchemaV1<Input, Output> {
  optional(): XantoSchema<Input | undefined, Output | undefined>
  optional<DefaultValue>(defaultValue: DefaultValue): XantoSchema<Input | undefined, Output | DefaultValue>
  default<DefaultValue>(defaultValue: DefaultValue): XantoSchema<Input | undefined, Output | DefaultValue>
}

export type StringFormatMethods = 'email' | 'url' | 'uuid'

type StringMethods<Excluded extends string> = {
  min(length: number, message?: string): XantoStringSchema<Excluded | 'length'>
  max(length: number, message?: string): XantoStringSchema<Excluded | 'length'>
  length(length: number, message?: string): XantoStringSchema<Excluded | 'min' | 'max' | 'length'>
  regex(pattern: RegExp, message?: string): XantoStringSchema<Excluded>

  email(message?: string): XantoStringSchema<Excluded | StringFormatMethods>
  url(message?: string): XantoStringSchema<Excluded | StringFormatMethods>
  uuid(message?: string): XantoStringSchema<Excluded | StringFormatMethods | 'min' | 'max' | 'length'>
}

export type XantoStringSchema<Excluded extends string = never> = Omit<XantoSchema<string, string>, 'optional' | 'default'> &
  Omit<StringMethods<Excluded>, Excluded> & {
    optional(): XantoStringSchema<Excluded>
    optional<D>(defaultValue: D): XantoStringSchema<Excluded>
    default<D>(defaultValue: D): XantoStringSchema<Excluded>
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

export interface XantoDateSchema extends XantoSchema<Date | string, Date> {
  min(date: Date, message?: string): XantoDateSchema
  max(date: Date, message?: string): XantoDateSchema
  coerce(): Omit<XantoDateSchema, 'coerce'>
}

export interface XantoArraySchema<ItemInput, ItemOutput> extends XantoSchema<ItemInput[], ItemOutput[]> {
  min(length: number, message?: string): Omit<XantoArraySchema<ItemInput, ItemOutput>, 'length'>
  max(length: number, message?: string): Omit<XantoArraySchema<ItemInput, ItemOutput>, 'length'>
  length(length: number, message?: string): Omit<XantoArraySchema<ItemInput, ItemOutput>, 'min' | 'max' | 'length'>

  optional(): XantoArraySchema<ItemInput, ItemOutput>
  optional<D>(defaultValue: D): XantoArraySchema<ItemInput, ItemOutput>
  default<D>(defaultValue: D): XantoArraySchema<ItemInput, ItemOutput>
}

export interface XantoEnumSchema<T extends readonly string[]> extends XantoSchema<T[number], T[number]> {
  readonly options: T

  optional(): XantoEnumSchema<T>
  optional<D>(defaultValue: D): XantoEnumSchema<T>
  default<D>(defaultValue: D): XantoEnumSchema<T>
}

export interface XantoLiteralSchema<T extends string | number | boolean> extends XantoSchema<T, T> {
  readonly literalValue: T

  optional(): XantoLiteralSchema<T>
  optional<D>(defaultValue: D): XantoLiteralSchema<T>
  default<D>(defaultValue: D): XantoLiteralSchema<T>
}

export type InferUnionInput<T extends readonly StandardSchemaV1<any, any>[]> = InferInput<T[number]>
export type InferUnionOutput<T extends readonly StandardSchemaV1<any, any>[]> = InferOutput<T[number]>

export interface XantoUnionSchema<T extends readonly StandardSchemaV1<any, any>[]> extends XantoSchema<
  InferUnionInput<T>,
  InferUnionOutput<T>
> {
  readonly options: T

  optional(): XantoUnionSchema<T>
  optional<D>(defaultValue: D): XantoUnionSchema<T>
  default<D>(defaultValue: D): XantoUnionSchema<T>
}

export type ObjectShape = Record<string, StandardSchemaV1<any, any>>

export type InferObjectInput<T extends ObjectShape> = {
  [K in keyof T]: InferInput<T[K]>
}

export type InferObjectOutput<T extends ObjectShape> = {
  [K in keyof T]: InferOutput<T[K]>
}

export interface XantoObjectSchema<Shape extends ObjectShape> extends XantoSchema<
  InferObjectInput<Shape>,
  InferObjectOutput<Shape>
> {
  readonly shape: Shape

  optional(): XantoObjectSchema<Shape>
  optional<D>(defaultValue: D): XantoObjectSchema<Shape>
  default<D>(defaultValue: D): XantoObjectSchema<Shape>
}
