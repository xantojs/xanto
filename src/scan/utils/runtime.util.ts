/// <reference types="@types/deno" />
import { isDeno, isBun, isNode } from 'std-env'

import type { Runtime } from '../../types/runtime.types.js'

export function getProjectRoot(): string {
  if (isDeno) {
    return Deno.cwd()
  }
  if (isNode || isBun) {
    return process.cwd()
  }
  return '.'
}

export function getRuntime(): Runtime {
  if (isDeno) return 'deno'
  if (isBun) return 'bun'
  return 'node'
}
