import * as v from 'valibot'

const PathSchema = v.pipe(
  v.string(),
  v.minLength(1, 'Path cannot be empty'),
  v.regex(/^[a-zA-Z0-9/_-]+$/, 'Only letters, numbers, /, -, _ allowed'),
  v.custom((path) => {
    if (typeof path !== 'string') return false
    if (path.startsWith('/')) return false
    if (path.includes('//')) return false
    if (path.includes('./')) return false
    if (path.includes('/../')) return false
    if (path.endsWith('/..')) return false
    if (path.endsWith('/.')) return false
    return true
  }, 'Path contains invalid patterns (/, ./, ../, /..)')
)

export function validatePath(path: string) {
  const result = v.safeParse(PathSchema, path)
  if (!result.success) {
    const issue = result.issues[0]
    throw new Error(`Invalid path "${path}": ${issue.message || 'Unknown error'}`)
  }
  return result.output
}
