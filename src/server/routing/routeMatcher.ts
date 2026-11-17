import { normalizeRoute } from 'h3'

import type { ParsedRoute } from '../../types/route.types.js'

type Params = Record<string, string | string[]>

interface TrieNode {
  staticChildren: Map<string, TrieNode>
  typedChild?: {
    name: string
    pattern: RegExp
    node: TrieNode
  }
  dynamicChild?: {
    name: string
    node: TrieNode
  }
  catchAllChild?: {
    name: string
    node: TrieNode
  }
  route?: ParsedRoute
}

export interface RouteMatch {
  route: ParsedRoute
  params: Params
}

function createNode(): TrieNode {
  return {
    staticChildren: new Map(),
  }
}

function visit(node: TrieNode, parts: string[], index: number, params: Params): ParsedRoute | undefined {
  if (index === parts.length) {
    return node.route
  }

  const part = parts[index]!

  const staticChild = node.staticChildren.get(part)
  if (staticChild) {
    const route = visit(staticChild, parts, index + 1, params)
    if (route) return route
  }

  const typed = node.typedChild
  if (typed && typed.pattern.test(part)) {
    params[typed.name] = part

    const route = visit(typed.node, parts, index + 1, params)
    if (route) return route

    delete params[typed.name]
  }

  const dynamic = node.dynamicChild
  if (dynamic && part !== '') {
    params[dynamic.name] = part

    const route = visit(dynamic.node, parts, index + 1, params)
    if (route) return route

    delete params[dynamic.name]
  }

  const catchAll = node.catchAllChild
  if (catchAll && part !== '') {
    params[catchAll.name] = parts.slice(index)

    const route = catchAll.node.route
    if (route) return route

    delete params[catchAll.name]
  }

  return undefined
}

function splitPath(pathname: string): string[] {
  const path = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname

  return path === '/' ? [] : path.slice(1).split('/')
}

export function createRouteMatcher(routes: ParsedRoute[]) {
  const roots = new Map<string, TrieNode>()

  for (const route of routes) {
    if (!route.segments) continue

    let root = roots.get(route.method)
    if (!root) {
      root = createNode()
      roots.set(route.method, root)
    }

    let node = root

    for (const segment of route.segments) {
      switch (segment.type) {
        case 'group':
          break

        case 'static': {
          const key = normalizeRoute(`/${segment.value}`).slice(1)

          let child = node.staticChildren.get(key)
          if (!child) {
            child = createNode()
            node.staticChildren.set(key, child)
          }

          node = child
          break
        }

        case 'typed-dynamic': {
          if (!node.typedChild) {
            const value = segment.value!
            const pattern = value.slice(value.indexOf('('))

            node.typedChild = {
              name: segment.paramName!,
              pattern: new RegExp(`^${pattern}$`),
              node: createNode(),
            }
          }

          node = node.typedChild.node
          break
        }

        case 'dynamic': {
          node.dynamicChild ??= {
            name: segment.paramName!,
            node: createNode(),
          }

          node = node.dynamicChild.node
          break
        }

        case 'catch-all': {
          node.catchAllChild ??= {
            name: segment.paramName!,
            node: createNode(),
          }

          node = node.catchAllChild.node
          break
        }
      }
    }

    node.route = route
  }

  function findInMethod(method: string, parts: string[]): RouteMatch | undefined {
    const root = roots.get(method)
    if (!root) return undefined

    const params: Params = Object.create(null)
    const route = visit(root, parts, 0, params)

    return route ? { route, params } : undefined
  }

  return (method: string, pathname: string): RouteMatch | undefined => {
    const parts = splitPath(pathname)

    const direct = findInMethod(method, parts)
    if (direct) return direct

    return method === 'HEAD' ? findInMethod('GET', parts) : undefined
  }
}
