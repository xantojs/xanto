import { glob } from 'tinyglobby'
import { join, normalize } from 'pathe'

import { HTTP_METHODS } from './const/httpMethods.const.js'
import { parseFile } from './parser/fileParser.js'
import { validateDiscoveredFiles } from './validator/fileValidator.js'
import { buildRoutes } from './builder/routeBuilder.js'

import type { DiscoveredFile } from './types/scan.types.js'
import type { ScannedRoute } from '../types/route.types.js'

const METHODS_GLOB = `{${HTTP_METHODS.map((m) => m.toLowerCase()).join(',')}}`
const EXTENSIONS_GLOB = `{ts,js,mts,mjs}`

export async function scanFiles(scanDir: string, entryDir: string): Promise<string[]> {
  return glob(
    [
      `${scanDir}/**/*.${METHODS_GLOB}.${EXTENSIONS_GLOB}`,
      `${scanDir}/**/${METHODS_GLOB}.${EXTENSIONS_GLOB}`,
      `${scanDir}/**/*.middleware.${EXTENSIONS_GLOB}`,
      `${scanDir}/**/middleware.${EXTENSIONS_GLOB}`,
      `${scanDir}/**/*.error.${EXTENSIONS_GLOB}`,
      `${scanDir}/**/error.${EXTENSIONS_GLOB}`,
    ],
    {
      cwd: entryDir,
      absolute: true,
      onlyFiles: true,
      ignore: ['**/node_modules/**', '**/.git/**', '**/_**/**', '**/*.d.ts', '**/*.{test,spec}.*'],
    }
  )
}

export async function scanRoutes(routesDir: string, entryDir: string): Promise<ScannedRoute[]> {
  const filePaths = await scanFiles(routesDir, entryDir)
  if (filePaths.length === 0) {
    return []
  }

  const routesRoot = normalize(join(entryDir, routesDir))
  const prefix = routesRoot + '/'
  const discovered: DiscoveredFile[] = []

  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i]!
    const normalizedPath = normalize(filePath)
    const relativePath = normalizedPath.startsWith(prefix)
      ? normalizedPath.slice(prefix.length)
      : normalizedPath

    const parsed = parseFile(filePath, relativePath)
    if (parsed) {
      discovered.push(parsed)
    }
  }

  if (discovered.length === 0) {
    return []
  }

  validateDiscoveredFiles(discovered)

  return buildRoutes(discovered)
}
