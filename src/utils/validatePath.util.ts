import * as v from 'valibot'

const PathSchema = v.pipe(
  v.string(),
  v.minLength(1, 'Path cannot be empty'),
  v.regex(/^[a-zA-Z0-9/_.-]+$/, 'Only letters, numbers, /, -, _, . allowed'),
  v.custom((path) => {
    if (typeof path !== 'string') return false
    if (path.startsWith('/')) return false
    if (path.includes('//')) return false

    const segments = path.split('/')
    const firstRealSegmentIndex = segments.findIndex((s) => s !== '.' && s !== '..')

    if (firstRealSegmentIndex === -1) return true

    const remainingSegments = segments.slice(firstRealSegmentIndex)
    const hasInvalidNavigation = remainingSegments.some((s) => s === '.' || s === '..')
    if (hasInvalidNavigation) return false

    const hasIcebergDots = segments.some((s) => /^\.{3,}$/.test(s))
    if (hasIcebergDots) return false

    return true
  }, 'Path contains invalid patterns')
)

export function validatePath(path: string) {
  const result = v.safeParse(PathSchema, path)

  if (!result.success) {
    const issue = result.issues[0]
    throw new Error(`Invalid path "${path}": ${issue.message || 'Unknown error'}`)
  }

  return result.output
}
