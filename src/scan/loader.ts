import { basename, join } from 'pathe'

import { scanFiles } from './scanner.js'
import { importModules } from './importer.js'
import { parseRoute } from './parser.js'

import { getProjectRoot } from './utils/runtime.util.js'
import { extractMethod } from './utils/extractor.util.js'

import type { Methods } from '../types/routing/methods.type.js'

export async function loadFiles(routesDir: string = 'routes', basePath: string = 'src') {
  const projectRoot = getProjectRoot()
  const entryDir = join(projectRoot, basePath)
  const routesRoot = join(entryDir, routesDir)

  const files = await scanFiles(routesDir, entryDir)
  if (files.length === 0) return

  const validRoutes = files.flatMap((file) => {
    const method = extractMethod(basename(file))

    return method ? [{ file, method }] : []
  })
  if (validRoutes.length === 0) return

  const methodMap = new Map<string, Methods>(validRoutes.map(({ file, method }) => [file, method]))

  const imported = await importModules(validRoutes.map(({ file }) => file))

  const routes = imported
    .filter(({ error }) => !error)
    .flatMap(({ file, module }) => {
      const method = methodMap.get(file)!

      if (!method) {
        return []
      }

      const route = parseRoute(file, routesRoot, method, module)

      return route ? [route] : []
    })

  routes.forEach(({ path, method }) => {
    console.log(`✅ [${method}] ${path}`)
  })
  return routes
}
