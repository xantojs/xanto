import { join } from 'pathe'

import { getProjectRoot } from './utils/runtime.util.js'

import { scanRouteFiles } from './scanner.js'
import { importModules } from './importer.js'

export async function loadFiles(routesDir: string = 'routes', basePath: string = 'src') {
  const projectRoot = getProjectRoot()
  const entryDir = join(projectRoot, basePath)

  const files = await scanRouteFiles(routesDir, entryDir)
  if (files.length === 0) return

  const imported = await importModules(files)

  imported.forEach(({ file, module, error }) => {
    if (error) {
      console.error(`❌ ${file}`)
    } else {
      console.log(`✅ ${file}: `, module.default)
    }
  })

  return imported
}
