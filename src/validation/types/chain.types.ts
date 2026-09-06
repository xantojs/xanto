import type { StandardSchemaV1, InferInput, InferOutput } from '../../types/schema.types.js'

export interface XantoSchema<Input = unknown, Output = Input> extends StandardSchemaV1<Input, Output> {
  optional(): XantoSchema<Input | undefined, Output | undefined>
  optional<DefaultValue>(defaultValue: DefaultValue): XantoSchema<Input | undefined, Output | DefaultValue>
  default<DefaultValue>(defaultValue: DefaultValue): XantoSchema<Input | undefined, Output | DefaultValue>
}

export type StringFormatMethods = 'email' | 'url' | 'uuid'

type StringMethods<Excluded extends string> = {
  min(length: number, message?: string): XantoStringSchema<Excluded | 'min' | 'length'>
  max(length: number, message?: string): XantoStringSchema<Excluded | 'max' | 'length'>

  length(length: number, message?: string): XantoStringSchema<Excluded | 'min' | 'max' | 'length'>

  regex(pattern: RegExp, message?: string): XantoStringSchema<Excluded | 'regex'>

  email(message?: string): XantoStringSchema<Excluded | StringFormatMethods>
  url(message?: string): XantoStringSchema<Excluded | StringFormatMethods>
  uuid(message?: string): XantoStringSchema<Excluded | StringFormatMethods>
}

export type XantoStringSchema<Excluded extends string = never> = Omit<XantoSchema<string, string>, 'optional' | 'default'> &
  Omit<StringMethods<Excluded>, Excluded> & {
    optional(): XantoStringSchema<Excluded>
    optional<D>(defaultValue: D): XantoStringSchema<Excluded>
    default<D>(defaultValue: D): XantoStringSchema<Excluded>
  }

type NumberMethods<Excluded extends string> = {
  min(value: number, message?: string): XantoNumberSchema<Excluded | 'min'>
  max(value: number, message?: string): XantoNumberSchema<Excluded | 'max'>
  integer(message?: string): XantoNumberSchema<Excluded | 'integer'>
  coerce(): XantoNumberSchema<Excluded | 'coerce'>
}

export type XantoNumberSchema<Excluded extends string = never> = Omit<XantoSchema<number, number>, 'optional' | 'default'> &
  Omit<NumberMethods<Excluded>, Excluded> & {
    optional(): XantoNumberSchema<Excluded>
    optional<D>(defaultValue: D): XantoNumberSchema<Excluded>
    default<D>(defaultValue: D): XantoNumberSchema<Excluded>
  }

export interface XantoBooleanSchema extends XantoSchema<boolean, boolean> {
  coerce(): Omit<XantoBooleanSchema, 'coerce'>
}

export interface XantoDateSchema extends XantoSchema<Date | string, Date> {
  min(date: Date, message?: string): XantoDateSchema
  max(date: Date, message?: string): XantoDateSchema
  coerce(): Omit<XantoDateSchema, 'coerce'>
}

type ArrayMethods<ItemInput, ItemOutput, Excluded extends string> = {
  min(length: number, message?: string): XantoArraySchema<ItemInput, ItemOutput, Excluded | 'min' | 'length'>
  max(length: number, message?: string): XantoArraySchema<ItemInput, ItemOutput, Excluded | 'max' | 'length'>
  length(length: number, message?: string): XantoArraySchema<ItemInput, ItemOutput, Excluded | 'min' | 'max' | 'length'>
}

export type XantoArraySchema<ItemInput, ItemOutput, Excluded extends string = never> = Omit<
  XantoSchema<ItemInput[], ItemOutput[]>,
  'optional' | 'default'
> &
  Omit<ArrayMethods<ItemInput, ItemOutput, Excluded>, Excluded> & {
    optional(): XantoArraySchema<ItemInput, ItemOutput, Excluded>
    optional<D>(defaultValue: D): XantoArraySchema<ItemInput, ItemOutput, Excluded>
    default<D>(defaultValue: D): XantoArraySchema<ItemInput, ItemOutput, Excluded>
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

export type InferUnionInput<T extends readonly StandardSchemaV1[]> = InferInput<T[number]>
export type InferUnionOutput<T extends readonly StandardSchemaV1[]> = InferOutput<T[number]>

export interface XantoUnionSchema<T extends readonly StandardSchemaV1[]> extends XantoSchema<
  InferUnionInput<T>,
  InferUnionOutput<T>
> {
  readonly options: T

  optional(): XantoUnionSchema<T>
  optional<D>(defaultValue: D): XantoUnionSchema<T>
  default<D>(defaultValue: D): XantoUnionSchema<T>
}

export type ObjectShape = Record<string, StandardSchemaV1>

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
