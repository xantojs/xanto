import { join } from 'pathe'

import { getProjectRoot } from './utils/runtime.util.js'
import { scanRouteFiles } from './scanner.js'
import { importModules } from './importer.js'
import { parseRoute } from './parser.js'

import type { ParsedRoute } from '../types/routing/routing.types.js'

export async function loadFiles(routesDir: string = 'routes', basePath: string = 'src') {
  const projectRoot = getProjectRoot()
  const entryDir = join(projectRoot, basePath)
  const fullRoutesDir = join(entryDir, routesDir)

  const files = await scanRouteFiles(routesDir, entryDir)
  if (files.length === 0) return

  const imported = await importModules(files)

  const routes = imported
    .filter(({ error }) => !error)
    .map(({ file, module }) => parseRoute(file, fullRoutesDir, module))
    .filter((route): route is ParsedRoute => route !== null)

  routes.forEach(({ path, method }) => {
    console.log(`✅ [${method}] ${path}`)
  })

  return routes
}