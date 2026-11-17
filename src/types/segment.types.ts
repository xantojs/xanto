export type SegmentType = 'static' | 'dynamic' | 'typed-dynamic' | 'catch-all' | 'group'

export interface ParsedSegment {
  raw: string
  type: SegmentType
  value: string | null
  paramName?: string
  paramType?: string
}