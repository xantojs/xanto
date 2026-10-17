import { pathToFileURL } from 'node:url'

import type { ImporterModule } from './types/importerModule.types.js'

export async function importModules(files: string[]): Promise<ImporterModule[]> {
  const results: ImporterModule[] = []

  for (const file of files) {
    try {
      const fileUrl = pathToFileURL(file).href
      const module = await import(fileUrl)

      results.push({
        file,
        module,
      })
    } catch (error) { 
      results.push({
        file,
        module: null,
        error: error instanceof Error ? error : new Error(String(error)),
      })
    }
  }

  return results
}
