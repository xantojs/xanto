import type { Methods } from '../../types/methods.types.js'
import type { ParsedSegment } from '../../types/segment.types.js'

export type { ParsedSegment, SegmentType } from '../../types/segment.types.js'

export type FileKind = 'route' | 'middleware' | 'error'

export interface ParsedFilename {
  raw: string
  kind: FileKind
  method?: Methods
  prefix?: string
}

export interface DiscoveredFile {
  filePath: string
  relativePath: string
  filename: ParsedFilename
  segments: ParsedSegment[]
}
