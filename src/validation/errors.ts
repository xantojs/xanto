import type { StandardIssue } from '../types/schema.types.js'

export class ValidationError extends Error {
  constructor(public readonly issuses: readonly StandardIssue[]) {
    super(issuses.length > 0 ? issuses[0]?.message : 'Validation failed')
    this.name = 'ValidationError'

    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}
