import { glob } from 'tinyglobby'

import { HTTP_METHODS } from './const/httpMethods.const.js'

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
