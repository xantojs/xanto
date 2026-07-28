import { isDeno, isBun, isNode } from 'std-env'

export function getProjectRoot(): string {
  if (isDeno) {
    return Deno.cwd()
  }
  if (isNode || isBun) {
    return process.cwd()
  }
  return '.'
}

export function getRuntime(): 'node' | 'bun' | 'deno' {
  if (isDeno) return 'deno'
  if (isBun) return 'bun'
  return 'node'
}
