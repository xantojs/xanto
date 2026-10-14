import { describe, expect, it } from 'vitest'
import { ValidationError } from './errors/index.js'
import type { StandardIssue } from '../types/schema.types.js'

describe('ValidationError', () => {
  it('should format message with multiple issues and paths', () => {
    const issues: StandardIssue[] = [
      { message: 'Required', path: ['user', 'name'] },
      { message: 'Invalid email', path: ['user', 'email'] },
      { message: 'Must be positive', path: ['items', 0, 'price'] },
    ]

    const error = new ValidationError(issues)
    expect(error.name).toBe('ValidationError')
    expect(error.message).toBe('user.name: Required; user.email: Invalid email; items[0].price: Must be positive')
  })

  it('should handle issues without path as root errors', () => {
    const issues: StandardIssue[] = [{ message: 'Invalid root payload' }]

    const error = new ValidationError(issues)
    expect(error.message).toBe('Invalid root payload')
  })

  it('should handle empty issues', () => {
    const error = new ValidationError([])
    expect(error.message).toBe('Validation failed')
  })

  it('should flatten issues correctly', () => {
    const issues: StandardIssue[] = [
      { message: 'Root error 1' },
      { message: 'Root error 2' },
      { message: 'Name is required', path: ['name'] },
      { message: 'Name too short', path: ['name'] },
      { message: 'Invalid email', path: ['contact', 'email'] },
    ]

    const error = new ValidationError(issues)
    const flat = error.flatten()

    expect(flat.formErrors).toEqual(['Root error 1', 'Root error 2'])
    expect(flat.fieldErrors).toEqual({
      name: ['Name is required', 'Name too short'],
      'contact.email': ['Invalid email'],
    })
  })

  it('should get issues for specific path', () => {
    const issues: StandardIssue[] = [
      { message: 'Required', path: ['user', 'age'] },
      { message: 'Must be >= 18', path: ['user', 'age'] },
      { message: 'Invalid name', path: ['user', 'name'] },
    ]

    const error = new ValidationError(issues)

    expect(error.getIssuesForPath('user.age')).toHaveLength(2)
    expect(error.getIssuesForPath(['user', 'age'])).toHaveLength(2)
    expect(error.getIssuesForPath('user.name')).toHaveLength(1)
    expect(error.getIssuesForPath('user.other')).toEqual([])
  })

  it('should serialize to JSON', () => {
    const issues: StandardIssue[] = [{ message: 'Invalid input', path: ['field'] }]

    const error = new ValidationError(issues)
    const json = error.toJSON()

    expect(json).toEqual({
      name: 'ValidationError',
      message: 'field: Invalid input',
      issues,
    })
  })
})
