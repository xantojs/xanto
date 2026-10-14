import type { Methods } from '../../types/methods.types.js'
import type { ParsedFilename } from '../types/scan.types.js'

const EXTENSION_REGEX = /\.(ts|js|mts|mjs)$/i

const METHOD_MAP: Record<string, Methods> = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  delete: 'DELETE',
  patch: 'PATCH',
  head: 'HEAD',
  options: 'OPTIONS',
}

export function parseFilename(filename: string): ParsedFilename | null {
  const extMatch = EXTENSION_REGEX.exec(filename)
  if (!extMatch) {
    return null
  }

  const base = filename.slice(0, extMatch.index)
  if (!base) {
    return null
  }

  const dotIndex = base.lastIndexOf('.')

  if (dotIndex === -1) {
    const lower = base.toLowerCase()

    if (lower === 'middleware') {
      return { raw: filename, kind: 'middleware' }
    }

    if (lower === 'error') {
      return { raw: filename, kind: 'error' }
    }

    const method = METHOD_MAP[lower]
    if (method) {
      return { raw: filename, kind: 'route', method }
    }

    return null
  }

  const prefix = base.slice(0, dotIndex)
  const suffix = base.slice(dotIndex + 1).toLowerCase()

  if (!prefix) {
    return null
  }

  if (suffix === 'middleware') {
    return { raw: filename, kind: 'middleware', prefix }
  }

  if (suffix === 'error') {
    return { raw: filename, kind: 'error', prefix }
  }

  const method = METHOD_MAP[suffix]
  if (method) {
    return { raw: filename, kind: 'route', method, prefix }
  }

  return null
}
