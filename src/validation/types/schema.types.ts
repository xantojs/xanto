export interface StandardIssue {
  readonly message: string
  readonly path?: ReadonlyArray<string | number | symbol> | undefined
}

export interface StandardSuccessResult<Output> {
  readonly value: Output
  readonly issues?: undefined
}

export interface StandardFailureResult {
  readonly issues: ReadonlyArray<StandardIssue>
}

export type StandardResult<Output> = StandardSuccessResult<Output> | StandardFailureResult

export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly '~standard': {
    readonly version: 1
    readonly vendor: 'xanto'
    readonly validate: (value: unknown) => StandardResult<Output> | Promise<StandardResult<Output>>
    readonly types?: {
      readonly input: Input
      readonly output: Output
    }
  }
}

export type InferInput<T> = T extends StandardSchemaV1<infer I, any> ? I : unknown
export type InferOutput<T> = T extends StandardSchemaV1<any, infer O> ? O : unknown
