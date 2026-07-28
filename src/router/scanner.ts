import { glob } from 'tinyglobby'
import { join } from 'pathe'

export async function scanRouteFiles(routesDir: string, entryDir: string): Promise<string[]> {
  const files = await glob(`${routesDir}/**/*.ts`, {
    cwd: entryDir,
    absolute: true,
  })

  if (files.length === 0) {
    console.error(`No route files found in: ${join(entryDir, routesDir)}`)
    return []
  }

  return files
}
