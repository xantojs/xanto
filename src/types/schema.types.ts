export type {
  StandardSchemaV1,
  StandardSchemaV1 as StandardSchema,
} from '@standard-schema/spec'

import type { StandardSchemaV1 } from '@standard-schema/spec'

export type InferInput<T extends StandardSchemaV1> = NonNullable<
  T['~standard']['types']
>['input']

export type InferOutput<T extends StandardSchemaV1> = NonNullable<
  T['~standard']['types']
>['output']

export type StandardResult<Output> = StandardSchemaV1.Result<Output>
export type StandardSuccessResult<Output> = StandardSchemaV1.SuccessResult<Output>
export type StandardFailureResult = StandardSchemaV1.FailureResult
export type StandardIssue = StandardSchemaV1.Issue