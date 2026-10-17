import { SegmentSyntaxError } from '../errors/syntax.error.js'

const SUPPORTED_PARAM_TYPES: Record<string, string> = {
  number: '(\\d+)',
}

export interface ParsedParamType {
  paramType: string
  pattern: string
}

export function parseParamType(paramType: string, raw: string): ParsedParamType {
  const pattern = SUPPORTED_PARAM_TYPES[paramType]
  if (!pattern) {
    throw new SegmentSyntaxError(
      `Unsupported parameter type "${paramType}" in "${raw}". Supported types: ${Object.keys(SUPPORTED_PARAM_TYPES).join(', ')}.`,
      raw
    )
  }

  return {
    paramType,
    pattern,
  }
}
