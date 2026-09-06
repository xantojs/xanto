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
    optional<D>(defaultValue: D): XantoSchema<string | undefined, string | D>
    default<D>(defaultValue: D): XantoSchema<string | undefined, string | D>
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
    optional<D>(defaultValue: D): XantoSchema<number | undefined, number | D>
    default<D>(defaultValue: D): XantoSchema<number | undefined, number | D>
  }

type BooleanMethods<Excluded extends string> = {
  coerce(): XantoBooleanSchema<Excluded | 'coerce'>
}

export type XantoBooleanSchema<Excluded extends string = never> = Omit<XantoSchema<boolean, boolean>, 'optional' | 'default'> &
  Omit<BooleanMethods<Excluded>, Excluded> & {
    optional(): XantoBooleanSchema<Excluded>
    optional<D>(defaultValue: D): XantoSchema<boolean | undefined, boolean | D>
    default<D>(defaultValue: D): XantoSchema<boolean | undefined, boolean | D>
  }

type DateMethods<Excluded extends string> = {
  min(date: Date, message?: string): XantoDateSchema<Excluded | 'min'>
  max(date: Date, message?: string): XantoDateSchema<Excluded | 'max'>
  coerce(): XantoDateSchema<Excluded | 'coerce'>
}

export type XantoDateSchema<Excluded extends string = never> = Omit<XantoSchema<Date | string, Date>, 'optional' | 'default'> &
  Omit<DateMethods<Excluded>, Excluded> & {
    optional(): XantoDateSchema<Excluded>
    optional<D>(defaultValue: D): XantoSchema<Date | string | undefined, Date | D>
    default<D>(defaultValue: D): XantoSchema<Date | string | undefined, Date | D>
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
    optional<D>(defaultValue: D): XantoSchema<ItemInput[] | undefined, ItemOutput[] | D>
    default<D>(defaultValue: D): XantoSchema<ItemInput[] | undefined, ItemOutput[] | D>
  }

export interface XantoEnumSchema<T extends readonly string[]> extends XantoSchema<T[number], T[number]> {
  readonly options: T

  optional(): XantoEnumSchema<T>
  optional<D>(defaultValue: D): XantoSchema<T[number] | undefined, T[number] | D>
  default<D>(defaultValue: D): XantoSchema<T[number] | undefined, T[number] | D>
}

export interface XantoLiteralSchema<T extends string | number | boolean> extends XantoSchema<T, T> {
  readonly literalValue: T

  optional(): XantoLiteralSchema<T>
  optional<D>(defaultValue: D): XantoSchema<T | undefined, T | D>
  default<D>(defaultValue: D): XantoSchema<T | undefined, T | D>
}

export type InferUnionInput<T extends readonly StandardSchemaV1[]> = InferInput<T[number]>
export type InferUnionOutput<T extends readonly StandardSchemaV1[]> = InferOutput<T[number]>

export interface XantoUnionSchema<T extends readonly StandardSchemaV1[]> extends XantoSchema<
  InferUnionInput<T>,
  InferUnionOutput<T>
> {
  readonly options: T

  optional(): XantoUnionSchema<T>
  optional<D>(defaultValue: D): XantoSchema<InferUnionInput<T> | undefined, InferUnionOutput<T> | D>
  default<D>(defaultValue: D): XantoSchema<InferUnionInput<T> | undefined, InferUnionOutput<T> | D>
}

export type ObjectShape = Record<string, StandardSchemaV1>

export type InferObjectInput<T extends ObjectShape> = {
  [K in keyof T]: InferInput<T[K]>
}

export type InferObjectOutput<T extends ObjectShape> = {
  [K in keyof T]: InferOutput<T[K]>
}

export type ObjectMode = 'strip' | 'passthrough' | 'strict'

type ObjectModeMethods<Shape extends ObjectShape> = {
  strip(): XantoObjectSchema<Shape, ObjectMode>
  passthrough(): XantoObjectSchema<Shape, ObjectMode>
  strict(): XantoObjectSchema<Shape, ObjectMode>
}

export type XantoObjectSchema<Shape extends ObjectShape, Excluded extends ObjectMode = never> = Omit<
  XantoSchema<InferObjectInput<Shape>, InferObjectOutput<Shape>>,
  'optional' | 'default'
> &
  Omit<ObjectModeMethods<Shape>, Excluded> & {
    readonly shape: Shape

    optional(): XantoObjectSchema<Shape, Excluded>
    optional<D>(defaultValue: D): XantoSchema<InferObjectInput<Shape> | undefined, InferObjectOutput<Shape> | D>
    default<D>(defaultValue: D): XantoSchema<InferObjectInput<Shape> | undefined, InferObjectOutput<Shape> | D>
  }

export interface XantoNullableSchema<T extends StandardSchemaV1> extends XantoSchema<
  InferInput<T> | null,
  InferOutput<T> | null
> {
  readonly schema: T
}

export interface XantoTransformSchema<T extends StandardSchemaV1, TOutput> extends XantoSchema<InferInput<T>, TOutput> {}

export type TupleShape = readonly StandardSchemaV1[]

export type InferTupleInput<T extends TupleShape> = { [K in keyof T]: InferInput<T[K]> }
export type InferTupleOutput<T extends TupleShape> = { [K in keyof T]: InferOutput<T[K]> }

export interface XantoTupleSchema<T extends TupleShape> extends XantoSchema<InferTupleInput<T>, InferTupleOutput<T>> {
  readonly items: T
}

export interface XantoRecordSchema<K extends StandardSchemaV1, V extends StandardSchemaV1> extends XantoSchema<
  Record<string, InferInput<V>>,
  Record<string, InferOutput<V>>
> {
  readonly keySchema: K
  readonly valueSchema: V
}
