import type { StandardIssue } from '../types/schema.types.js'
import type { FlattenedErrors, ValidationErrorJSON } from './types/error.types.js'

function normalizePath(path?: ReadonlyArray<PropertyKey | { key: PropertyKey }>): (string | number)[] {
  if (!path || path.length === 0) return []
  return path.map((segment) => {
    if (typeof segment === 'object' && segment !== null && 'key' in segment) {
      return typeof segment.key === 'symbol' ? segment.key.toString() : (segment.key as string | number)
    }
    return typeof segment === 'symbol' ? segment.toString() : (segment as string | number)
  })
}

function formatPath(path?: ReadonlyArray<PropertyKey | { key: PropertyKey }>): string {
  const segments = normalizePath(path)
  if (segments.length === 0) return ''
  return segments.reduce<string>((acc, seg, idx) => {
    if (typeof seg === 'number') {
      return `${acc}[${seg}]`
    }
    return idx === 0 ? String(seg) : `${acc}.${String(seg)}`
  }, '')
}

function formatIssues(issues: readonly StandardIssue[]): string {
  if (issues.length === 0) return 'Validation failed'
  return issues
    .map((issue) => {
      const path = formatPath(issue.path)
      return path ? `${path}: ${issue.message}` : issue.message
    })
    .join('; ')
}

export class ValidationError extends Error {
  constructor(public readonly issues: readonly StandardIssue[]) {
    super(formatIssues(issues))
    this.name = 'ValidationError'
  }

  getIssuesForPath(path: string | (string | number)[]): StandardIssue[] {
    const targetPath =
      typeof path === 'string'
        ? path
        : path.reduce<string>((acc, seg, idx) => {
            if (typeof seg === 'number') return `${acc}[${seg}]`
            return idx === 0 ? String(seg) : `${acc}.${String(seg)}`
          }, '')

    return this.issues.filter((issue) => {
      const issuePath = formatPath(issue.path)
      return issuePath === targetPath
    })
  }

  flatten(): FlattenedErrors {
    const formErrors: string[] = []
    const fieldErrors: Record<string, string[]> = {}

    for (const issue of this.issues) {
      const path = formatPath(issue.path)
      if (!path) {
        formErrors.push(issue.message)
      } else {
        if (!fieldErrors[path]) {
          fieldErrors[path] = []
        }
        fieldErrors[path].push(issue.message)
      }
    }

    return { formErrors, fieldErrors }
  }

  toJSON(): ValidationErrorJSON {
    return {
      name: this.name,
      message: this.message,
      issues: this.issues,
    }
  }
}
