import { join } from 'pathe'

import { ScanError } from './errors/scan.error.js'
import { scanRoutes } from './scanner.js'
import { importModules } from './importer.js'
import { getProjectRoot } from './utils/runtime.util.js'

import type { ParsedRoute } from '../server/types/routing.types.js'

export async function loadFiles(
  routesDir: string = 'routes',
  basePath: string = 'src'
): Promise<ParsedRoute[] | undefined> {
  const projectRoot = getProjectRoot()
  const entryDir = join(projectRoot, basePath)

  const scannedRoutes = await scanRoutes(routesDir, entryDir)
  if (scannedRoutes.length === 0) {
    console.error(`No route files found in: ${join(entryDir, routesDir)}`)
    return
  }

  const filePaths = scannedRoutes.map((r) => r.filePath)
  const imported = await importModules(filePaths)

  const moduleMap = new Map<string, any>()
  for (const item of imported) {
    if (item.error) {
      throw new ScanError(`Failed to import ${item.file}: ${String(item.error)}`)
    }
    if (item.module) moduleMap.set(item.file, item.module)
  }

  const routes: ParsedRoute[] = []

  for (const scanned of scannedRoutes) {
    const def = moduleMap.get(scanned.filePath)?.default

    if (!def || typeof def !== 'object' || typeof def.handler !== 'function') {
      throw new ScanError(
        `Invalid default export in ${scanned.filePath}: expected a route created with route()`
      )
    }

    if (def.method !== scanned.method) {
      throw new ScanError(
        `Method mismatch in ${scanned.filePath}: filename defines ${scanned.method}, but route handler defines ${def.method}`
      )
    }

    routes.push({
      path: scanned.path,
      method: scanned.method,
      schema: def.schema,
      handler: def.handler,
    })
  }

  return routes
}
