import type { Methods } from '../../types/methods.type.js'

export type FileKind = 'route' | 'middleware' | 'error'

export type SegmentType = 'static' | 'dynamic' | 'typed-dynamic' | 'catch-all' | 'group'

export interface ParsedSegment {
  raw: string
  type: SegmentType
  value: string | null
  paramName?: string
  paramType?: string
}

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
