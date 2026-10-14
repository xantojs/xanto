import { join } from 'pathe'

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
  for (let i = 0; i < imported.length; i++) {
    const item = imported[i]!
    if (!item.error && item.module) {
      moduleMap.set(item.file, item.module)
    }
  }

  const routes: ParsedRoute[] = []

  for (let i = 0; i < scannedRoutes.length; i++) {
    const scanned = scannedRoutes[i]!
    const mod = moduleMap.get(scanned.filePath)

    if (!mod || !mod.default) {
      continue
    }

    routes.push({
      path: scanned.path,
      method: scanned.method,
      handler: mod.default,
    })

    console.log(`✅ [${scanned.method}] ${scanned.path}`)
  }

  return routes
}
