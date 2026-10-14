import type { DiscoveredFile, ParsedSegment } from '../types/scan.types.js'
import type { TrieNode } from '../types/trie.type.js'
import { RouteConflictError } from '../errors/conflict.error.js'

function createTrieNode(segment: ParsedSegment | null = null): TrieNode {
  return {
    segment,
    children: new Map(),
    files: [],
    dynamicChild: null,
    typedDynamicChild: null,
    catchAllChild: null,
  }
}

export function validateDiscoveredFiles(files: DiscoveredFile[]): void {
  const root = createTrieNode()
  const resolvedRouteUrls = new Map<string, string>()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const { segments, filename, relativePath } = file

    const seenParams = new Set<string>()

    for (let s = 0; s < segments.length; s++) {
      const seg = segments[s]!

      if (seg.type === 'catch-all' && s !== segments.length - 1) {
        throw new RouteConflictError(
          `Catch-all segment "${seg.raw}" must be the terminal segment. Found child segments in "${relativePath}".`,
          relativePath
        )
      }

      if (seg.paramName) {
        if (seenParams.has(seg.paramName)) {
          throw new RouteConflictError(
            `Duplicate parameter name "${seg.paramName}" in path "${relativePath}".`,
            relativePath
          )
        }
        seenParams.add(seg.paramName)
      }
    }

    let current = root

    for (let s = 0; s < segments.length; s++) {
      const seg = segments[s]!
      const segKey = seg.raw.toLowerCase()

      let next = current.children.get(segKey)

      if (!next) {
        next = createTrieNode(seg)

        if (seg.type === 'dynamic') {
          if (current.dynamicChild && current.dynamicChild.segment?.raw.toLowerCase() !== segKey) {
            throw new RouteConflictError(
              `Sibling dynamic segment conflict: "${current.dynamicChild.segment?.raw}" and "${seg.raw}" in path "${relativePath}".`,
              relativePath
            )
          }
          current.dynamicChild = next
        } else if (seg.type === 'typed-dynamic') {
          if (current.typedDynamicChild && current.typedDynamicChild.segment?.raw.toLowerCase() !== segKey) {
            throw new RouteConflictError(
              `Sibling typed dynamic segment conflict: "${current.typedDynamicChild.segment?.raw}" and "${seg.raw}" in path "${relativePath}".`,
              relativePath
            )
          }
          current.typedDynamicChild = next
        } else if (seg.type === 'catch-all') {
          if (current.catchAllChild && current.catchAllChild.segment?.raw.toLowerCase() !== segKey) {
            throw new RouteConflictError(
              `Sibling catch-all segment conflict: "${current.catchAllChild.segment?.raw}" and "${seg.raw}" in path "${relativePath}".`,
              relativePath
            )
          }
          current.catchAllChild = next
        }

        current.children.set(segKey, next)
      }

      current = next
    }

    let hasMiddleware = false
    let hasError = false
    const existingMethods = new Set<string>()

    for (let f = 0; f < current.files.length; f++) {
      const existing = current.files[f]!
      if (existing.filename.kind === 'middleware') {
        hasMiddleware = true
      } else if (existing.filename.kind === 'error') {
        hasError = true
      } else if (existing.filename.kind === 'route' && existing.filename.method) {
        existingMethods.add(existing.filename.method)
      }
    }

    if (filename.kind === 'middleware' && hasMiddleware) {
      throw new RouteConflictError(
        `Multiple middleware files detected in the same directory: "${relativePath}".`,
        relativePath
      )
    }

    if (filename.kind === 'error' && hasError) {
      throw new RouteConflictError(
        `Multiple error files detected in the same directory: "${relativePath}".`,
        relativePath
      )
    }

    if (filename.kind === 'route' && filename.method) {
      if (existingMethods.has(filename.method)) {
        throw new RouteConflictError(
          `Duplicate HTTP method "${filename.method}" in directory: "${relativePath}".`,
          relativePath
        )
      }

      const urlPatternParts: string[] = []
      for (let s = 0; s < segments.length; s++) {
        const seg = segments[s]!
        if (seg.type !== 'group') {
          if (seg.type === 'typed-dynamic') {
            urlPatternParts.push(`:param::${seg.paramType}`)
          } else if (seg.type === 'dynamic') {
            urlPatternParts.push(':param')
          } else if (seg.type === 'catch-all') {
            urlPatternParts.push('**')
          } else {
            urlPatternParts.push(seg.value || '')
          }
        }
      }
      const resolvedPattern = '/' + urlPatternParts.join('/')
      const normalizedPattern = resolvedPattern === '//' ? '/' : resolvedPattern.replace(/\/+/g, '/')
      const routeKey = `${filename.method} ${normalizedPattern}`

      const conflictingPath = resolvedRouteUrls.get(routeKey)
      if (conflictingPath) {
        throw new RouteConflictError(
          `Route conflict: "${routeKey}" is defined by both "${conflictingPath}" and "${relativePath}".`,
          relativePath
        )
      }
      resolvedRouteUrls.set(routeKey, relativePath)
    }

    current.files.push(file)
  }
}
