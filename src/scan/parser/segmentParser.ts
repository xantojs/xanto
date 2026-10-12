import type { ParsedSegment } from '../types/scan.types.js'

export function parseSegment(segment: string): ParsedSegment {
  const raw = segment.trim()
  const lower = raw.toLowerCase()

  if (lower.startsWith('(') && lower.endsWith(')')) {
    const groupName = lower.slice(1, -1).trim()
    if (!groupName) {
      throw new Error(`Invalid empty route group segment: "${raw}"`)
    }
    return {
      raw,
      type: 'group',
      value: null,
    }
  }

  if (lower.startsWith('[') && lower.endsWith(']')) {
    const inner = lower.slice(1, -1).trim()

    if (inner.startsWith('...')) {
      const paramName = inner.slice(3).trim()
      if (!paramName) {
        throw new Error(`Anonymous catch-all segment "[...]" is not supported: "${raw}"`)
      }
      if (paramName.includes('::')) {
        throw new Error(`Typed catch-all segment "[...name::type]" is not supported: "${raw}"`)
      }
      return {
        raw,
        type: 'catch-all',
        value: '**',
        paramName,
      }
    }

    if (inner.includes('::')) {
      const parts = inner.split('::')
      if (parts.length !== 2) {
        throw new Error(`Invalid typed parameter syntax: "${raw}"`)
      }
      const paramName = parts[0]!.trim()
      const paramType = parts[1]!.trim()

      if (!paramName || !paramType) {
        throw new Error(`Invalid typed parameter syntax: "${raw}"`)
      }

      return {
        raw,
        type: 'typed-dynamic',
        value: `:${paramName}`,
        paramName,
        paramType,
      }
    }

    const paramName = inner
    if (!paramName) {
      throw new Error(`Invalid empty parameter syntax: "${raw}"`)
    }

    return {
      raw,
      type: 'dynamic',
      value: `:${paramName}`,
      paramName,
    }
  }

  return {
    raw,
    type: 'static',
    value: lower,
  }
}
