import type { ParsedSegment } from '../types/scan.types.js'
import { SegmentSyntaxError } from '../errors/syntax.error.js'
import { parseParamType } from './paramTypeParser.js'

export function parseSegment(segment: string): ParsedSegment {
  const raw = segment.trim()
  const lower = raw.toLowerCase()

  if (lower.startsWith('[[') || lower.endsWith(']]')) {
    throw new SegmentSyntaxError(
      `Optional segments "${raw}" are not supported. Use separate routes instead.`,
      raw
    )
  }

  if (lower.startsWith('(') && lower.endsWith(')')) {
    const groupName = lower.slice(1, -1).trim()
    if (!groupName) {
      throw new SegmentSyntaxError(`Invalid empty route group segment: "${raw}"`, raw)
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
        throw new SegmentSyntaxError(`Anonymous catch-all segment "[...]" is not supported: "${raw}"`, raw)
      }
      if (paramName.includes('::')) {
        throw new SegmentSyntaxError(`Typed catch-all segment "[...name::type]" is not supported: "${raw}"`, raw)
      }
      return {
        raw,
        type: 'catch-all',
        value: `**:${paramName}`,
        paramName,
      }
    }

    if (inner.includes('::')) {
      const parts = inner.split('::')
      if (parts.length !== 2) {
        throw new SegmentSyntaxError(`Invalid typed parameter syntax: "${raw}"`, raw)
      }
      const paramName = parts[0]!.trim()
      const rawParamType = parts[1]!.trim()

      if (!paramName || !rawParamType) {
        throw new SegmentSyntaxError(`Invalid typed parameter syntax: "${raw}"`, raw)
      }

      const { paramType, pattern } = parseParamType(rawParamType, raw)

      return {
        raw,
        type: 'typed-dynamic',
        value: `:${paramName}${pattern}`,
        paramName,
        paramType,
      }
    }

    if (inner.includes('[') || inner.includes(']')) {
      throw new SegmentSyntaxError(
        `Multiple or nested parameters in a single segment "${raw}" are not supported.`,
        raw
      )
    }

    const paramName = inner
    if (!paramName) {
      throw new SegmentSyntaxError(`Invalid empty parameter syntax: "${raw}"`, raw)
    }

    return {
      raw,
      type: 'dynamic',
      value: `:${paramName}`,
      paramName,
    }
  }

  if (lower.includes('[') || lower.includes(']')) {
    throw new SegmentSyntaxError(
      `Partial dynamic segments or unclosed brackets in "${raw}" are not supported.`,
      raw
    )
  }

  return {
    raw,
    type: 'static',
    value: lower,
  }
}
