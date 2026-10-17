import type { StandardSchemaV1 } from '../../types/schema.types.js'

export class RequestValidationError extends Error {
    readonly issues: ReadonlyArray<StandardSchemaV1.Issue>

    constructor(issues: ReadonlyArray<StandardSchemaV1.Issue>) {
        super(issues.map((i) => i.message).join('; '))
        this.name = 'RequestValidationError'
        this.issues = issues
    }
}