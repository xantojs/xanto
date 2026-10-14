import { describe, it, expect } from 'vitest'
import { validateDiscoveredFiles } from './fileValidator.js'
import { parseFile } from '../parser/fileParser.js'
import type { DiscoveredFile } from '../types/scan.types.js'

function buildDiscovered(relativePaths: string[]): DiscoveredFile[] {
  return relativePaths.map((rel) => {
    const file = parseFile(`/root/${rel}`, rel)
    if (!file) throw new Error(`Invalid test file: ${rel}`)
    return file
  })
}

describe('validateDiscoveredFiles', () => {
  it('passes valid structure without errors', () => {
    const files = buildDiscovered([
      'get.ts',
      'middleware.ts',
      'error.ts',
      'users/get.ts',
      'users/post.ts',
      'users/[id::number]/get.ts',
      'users/[id]/get.ts',
      'docs/[...slug]/get.ts',
      '(admin)/dashboard/get.ts',
      '(public)/login/get.ts',
    ])

    expect(() => validateDiscoveredFiles(files)).not.toThrow()
  })

  it('throws on duplicate method in the same directory', () => {
    const files = buildDiscovered([
      'users/get.ts',
      'users/user.get.ts',
    ])

    expect(() => validateDiscoveredFiles(files)).toThrow(/Duplicate HTTP method "GET"/)
  })

  it('throws on multiple middleware files in the same directory', () => {
    const files = buildDiscovered([
      'users/middleware.ts',
      'users/auth.middleware.ts',
    ])

    expect(() => validateDiscoveredFiles(files)).toThrow(/Multiple middleware files detected/)
  })

  it('throws on multiple error files in the same directory', () => {
    const files = buildDiscovered([
      'users/error.ts',
      'users/validation.error.ts',
    ])

    expect(() => validateDiscoveredFiles(files)).toThrow(/Multiple error files detected/)
  })

  it('throws on non-terminal catch-all segment', () => {
    const files = buildDiscovered([
      'docs/[...slug]/subfolder/get.ts',
    ])

    expect(() => validateDiscoveredFiles(files)).toThrow(/must be the terminal segment/)
  })

  it('throws on duplicate parameter names in the same path', () => {
    const files = buildDiscovered([
      'users/[id]/posts/[id]/get.ts',
    ])

    expect(() => validateDiscoveredFiles(files)).toThrow(/Duplicate parameter name "id"/)
  })

  it('throws on sibling dynamic segments collision', () => {
    const files = buildDiscovered([
      'users/[id]/get.ts',
      'users/[slug]/post.ts',
    ])

    expect(() => validateDiscoveredFiles(files)).toThrow(/Sibling dynamic segment conflict/)
  })

  it('throws on sibling typed-dynamic segments collision', () => {
    const files = buildDiscovered([
      'users/[id::number]/get.ts',
      'users/[slug::string]/post.ts',
    ])

    expect(() => validateDiscoveredFiles(files)).toThrow(/Sibling typed dynamic segment conflict/)
  })

  it('throws on resolved route URL collision through groups', () => {
    const files = buildDiscovered([
      '(admin)/login/get.ts',
      '(public)/login/get.ts',
    ])

    expect(() => validateDiscoveredFiles(files)).toThrow(/Route conflict: "GET \/login"/)
  })

  it('allows same path with different HTTP methods across groups or folders', () => {
    const files = buildDiscovered([
      '(admin)/login/post.ts',
      '(public)/login/get.ts',
    ])

    expect(() => validateDiscoveredFiles(files)).not.toThrow()
  })
})
