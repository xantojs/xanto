import type { StandardIssue } from '../../types/schema.types.js'

export type FlattenedErrors = {
  formErrors: string[]
  fieldErrors: Record<string, string[]>
}

export type ValidationErrorJSON = {
  name: string
  message: string
  issues: readonly StandardIssue[]
}
