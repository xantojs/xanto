import type { StandardIssue } from '../types/schema.types.js'

export class ValidationError extends Error {
  constructor(public readonly issues: readonly StandardIssue[]) {
    super(issues.length > 0 ? issues[0]?.message : 'Validation failed')
    this.name = 'ValidationError'
  }
}
