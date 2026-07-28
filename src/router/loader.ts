import { basename, join } from 'pathe'

import { scanFiles } from './scanner.js'
import { importModules } from './importer.js'
import { parseRoute } from './parser.js'

import { getProjectRoot } from './utils/runtime.util.js'
import { extractMethod } from './utils/extractor.util.js'

import type { ParsedRoute } from '../types/routing/routing.types.js'

export async function loadFiles(routesDir: string = 'routes', basePath: string = 'src') {
  const projectRoot = getProjectRoot()
  const entryDir = join(projectRoot, basePath)
  const fullRoutesDir = join(entryDir, routesDir)

  const files = await scanFiles(routesDir, entryDir)
  if (files.length === 0) return

  const routeFiles = files.filter((file) => {
    const filename = basename(file)
    return extractMethod(filename) !== null
  })
  if (routeFiles.length === 0) return

  console.log(routeFiles)

  const imported = await importModules(routeFiles)

  console.log(imported)

  const routes = imported
    .filter(({ error }) => !error)
    .map(({ file, module }) => parseRoute(file, fullRoutesDir, module))
    .filter((route): route is ParsedRoute => route !== null)

  routes.forEach(({ path, method }) => {
    console.log(`✅ [${method}] ${path}`)
  })

  return routes
}
