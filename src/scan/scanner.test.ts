import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdir, writeFile, rm } from 'node:fs/promises'
import { join, normalize } from 'pathe'
import { scanFiles } from './scanner.js'

const FIXTURES_DIR = join(import.meta.dirname, '__test_fixtures__')

describe('scanFiles', () => {
  beforeAll(async () => {
    await rm(FIXTURES_DIR, { recursive: true, force: true })

    await mkdir(join(FIXTURES_DIR, 'routes/users/[id]'), { recursive: true })
    await mkdir(join(FIXTURES_DIR, 'routes/(admin)/dashboard'), { recursive: true })
    await mkdir(join(FIXTURES_DIR, 'routes/_helpers'), { recursive: true })
    await mkdir(join(FIXTURES_DIR, 'routes/node_modules/pkg'), { recursive: true })
    await mkdir(join(FIXTURES_DIR, 'routes/.git'), { recursive: true })

    await writeFile(join(FIXTURES_DIR, 'routes/get.ts'), '')
    await writeFile(join(FIXTURES_DIR, 'routes/post.js'), '')
    await writeFile(join(FIXTURES_DIR, 'routes/users/user.get.mts'), '')
    await writeFile(join(FIXTURES_DIR, 'routes/users/create.post.mjs'), '')
    await writeFile(join(FIXTURES_DIR, 'routes/users/[id]/delete.ts'), '')
    await writeFile(join(FIXTURES_DIR, 'routes/(admin)/dashboard/get.ts'), '')

    await writeFile(join(FIXTURES_DIR, 'routes/middleware.ts'), '')
    await writeFile(join(FIXTURES_DIR, 'routes/users/auth.middleware.ts'), '')
    await writeFile(join(FIXTURES_DIR, 'routes/error.ts'), '')
    await writeFile(join(FIXTURES_DIR, 'routes/users/validation.error.ts'), '')

    await writeFile(join(FIXTURES_DIR, 'routes/users/service.ts'), '')
    await writeFile(join(FIXTURES_DIR, 'routes/users/types.d.ts'), '')
    await writeFile(join(FIXTURES_DIR, 'routes/users/user.get.test.ts'), '')
    await writeFile(join(FIXTURES_DIR, 'routes/users/user.get.spec.js'), '')
    await writeFile(join(FIXTURES_DIR, 'routes/_helpers/util.get.ts'), '')
    await writeFile(join(FIXTURES_DIR, 'routes/node_modules/pkg/index.get.ts'), '')
    await writeFile(join(FIXTURES_DIR, 'routes/.git/config.get.ts'), '')
  })

  afterAll(async () => {
    await rm(FIXTURES_DIR, { recursive: true, force: true })
  })

  it('should scan valid routes, middlewares, errors and ignore private files', async () => {
    const files = await scanFiles('routes', FIXTURES_DIR)
    const normalizedPrefix = normalize(FIXTURES_DIR) + '/'

    const relativePaths = files
      .map((filePath) => normalize(filePath).replace(normalizedPrefix, ''))
      .sort()

    expect(relativePaths).toEqual([
      'routes/(admin)/dashboard/get.ts',
      'routes/error.ts',
      'routes/get.ts',
      'routes/middleware.ts',
      'routes/post.js',
      'routes/users/[id]/delete.ts',
      'routes/users/auth.middleware.ts',
      'routes/users/create.post.mjs',
      'routes/users/user.get.mts',
      'routes/users/validation.error.ts',
    ])
  })

  it('should return empty array for non-existent directory', async () => {
    const files = await scanFiles('non_existing_dir', FIXTURES_DIR)
    expect(files).toEqual([])
  })
})
