import { glob } from 'tinyglobby'
import { join } from 'pathe'

export async function scanFiles(scanDir: string, entryDir: string): Promise<string[]> {
  const files = await glob(`${scanDir}/**/*.ts`, {
    cwd: entryDir,
    absolute: true,
  })

  if (files.length === 0) {
    console.error(`No route files found in: ${join(entryDir, scanDir)}`)
    return []
  }

  return files
}
