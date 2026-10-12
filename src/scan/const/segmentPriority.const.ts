import type { SegmentType } from '../types/scan.types.js'

export const SEGMENT_PRIORITY: Record<SegmentType, number> = {
  static: 4,
  'typed-dynamic': 3,
  dynamic: 2,
  'catch-all': 1,
  group: 0,
} as const
