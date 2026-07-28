import { join } from 'pathe'
import { pathToFileURL } from 'node:url'

import { getProjectRoot } from './utils/runtime.js'

import { scanRouteFiles } from './scanner.js'

export async function loadFiles(routesDir: string = 'routes') {
  const projectRoot = getProjectRoot()
  const entryDir = join(projectRoot, 'src')

  const files = await scanRouteFiles(routesDir, entryDir)

  if (files.length === 0) return

  const firstFile = files[0]!
  const fileUrl = pathToFileURL(firstFile).href
  const module = await import(fileUrl)

  console.log('Successfully loaded route:', module.default)
}
