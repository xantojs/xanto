import { basename, join } from 'pathe'

import { scanFiles } from './scanner.js'
import { importModules } from './importer.js'
import { parseRoute } from './parser.js'

import { getProjectRoot } from './utils/runtime.util.js'
import { extractMethod } from './utils/extractor.util.js'

import type { ParsedRoute } from '../types/routing/routing.types.js'
import type { Methods } from '../types/routing/methods.type.js'

export async function loadFiles(routesDir: string = 'routes', basePath: string = 'src') {
  const projectRoot = getProjectRoot()
  const entryDir = join(projectRoot, basePath)
  const fullRoutesDir = join(entryDir, routesDir)

  const files = await scanFiles(routesDir, entryDir)
  if (files.length === 0) return

  const validRoutes = files
    .map((file) => {
      const method = extractMethod(basename(file))
      return { file, method }
    })
    .filter((item): item is { file: string; method: Methods } => item.method !== null)
  if (validRoutes.length === 0) return

  console.log(validRoutes)

  const imported = await importModules(validRoutes.map((r) => r.file))

  console.log(imported)

  const routes = imported
    .filter(({ error }) => !error)
    .map(({ file, module }) => {
      const v = validRoutes.find((r) => r.file === file)!
      return parseRoute(file, fullRoutesDir, v.method, module)
    })
    .filter((route): route is ParsedRoute => route !== null)

  routes.forEach(({ path, method }) => {
    console.log(`✅ [${method}] ${path}`)
  })

  return routes
}
