import { beforeAll, describe, expect, it } from 'vitest'
import { loadFiles } from '../../src/scan/loader.js'
import { createTestClient, type TestClient } from './helpers/testClient.js'

describe('Integration: nested route priority', () => {
  let client: TestClient

  beforeAll(async () => {
    const routes = await loadFiles('routingPriority', 'tests/integration/fixtures')
    client = createTestClient(routes)
  })

  it('prefers a typed segment before a plain segment at the same level', async () => {
    const response = await client.get('/priority/123/settings')

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('typed')
  })

  it('falls back to a plain segment when the typed segment does not match', async () => {
    const response = await client.get('/priority/abc/settings')

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('plain')
  })
})
