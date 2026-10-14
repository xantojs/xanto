import { basename, dirname, normalize } from 'pathe'
import { parseSegment } from './segmentParser.js'
import { parseFilename } from './filenameParser.js'
import type { DiscoveredFile } from '../types/scan.types.js'

export function parseFile(filePath: string, relativePath: string): DiscoveredFile | null {
  const normalizedRelative = normalize(relativePath).replace(/^\/+|\/+$/g, '')
  if (!normalizedRelative) {
    return null
  }

  const filenameStr = basename(normalizedRelative)
  const parsedFilename = parseFilename(filenameStr)
  if (!parsedFilename) {
    return null
  }

  const dir = dirname(normalizedRelative)
  const segments = dir === '.' || dir === ''
    ? []
    : dir.split('/').map((seg) => parseSegment(seg))

  return {
    filePath,
    relativePath: normalizedRelative,
    filename: parsedFilename,
    segments,
  }
}
