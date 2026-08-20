import { glob } from 'tinyglobby'
import { join } from 'pathe'

export async function scanFiles(scanDir: string, entryDir: string): Promise<string[]> {
  const files = await glob(`${scanDir}/**/*.ts`, {
    cwd: entryDir,
    absolute: true,
  })

  return files
}
