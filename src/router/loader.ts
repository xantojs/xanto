import { glob } from 'tinyglobby'
import { join } from 'pathe'
import { pathToFileURL } from 'node:url'

export async function loadFiles() {
  //@ts-ignore
  const projectRoot =
    typeof globalThis !== 'undefined' && (globalThis as any).Deno?.cwd
      ? (globalThis as any).Deno.cwd()
      : typeof process !== 'undefined'
        ? process.cwd()
        : '.'

  const entryDir = join(projectRoot, 'src')

  const files = await glob('routes/**/*.ts', {
    cwd: entryDir,
    absolute: true,
  })

  if (files.length === 0) {
    console.error(`No route files found in: ${join(entryDir, 'routes')}`)
    return
  }

  const firstFile = files[0]!

  const fileUrl = pathToFileURL(firstFile).href

  const module = await import(fileUrl)

  console.log('Successfully loaded route:', module.default)
}
