import { createH3App } from '../../../src/server/server.js'
import type { ParsedRoute } from '../../../src/types/route.types.js'

export interface TestResponse {
  status: number
  headers: Headers
  text(): Promise<string>
  json<T = unknown>(): Promise<T>
}

export interface TestClient {
  fetch(input: string | URL | Request, init?: RequestInit): Promise<Response>
  get(path: string, headers?: HeadersInit): Promise<TestResponse>
  post(path: string, body?: unknown, headers?: HeadersInit): Promise<TestResponse>
  put(path: string, body?: unknown, headers?: HeadersInit): Promise<TestResponse>
  delete(path: string, headers?: HeadersInit): Promise<TestResponse>
}

export function createTestClient(routes: ParsedRoute[]): TestClient {
  const app = createH3App(routes)

  async function request(path: string, init: RequestInit = {}): Promise<TestResponse> {
    const url = path.startsWith('http') ? path : `http://localhost${path.startsWith('/') ? '' : '/'}${path}`
    const res = await app.fetch(new Request(url, init))

    return {
      status: res.status,
      headers: res.headers,
      text: () => res.text(),
      json: <T>() => res.json() as Promise<T>,
    }
  }

  return {
    fetch: async (input, init) => {
      const req = input instanceof Request ? input : new Request(String(input), init)
      return app.fetch(req)
    },
    get: (path, headers) =>
      request(path, {
        method: 'GET',
        ...(headers ? { headers } : {}),
      }),
    post: (path, body, headers) =>
      request(path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(headers as Record<string, string>),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      }),
    put: (path, body, headers) =>
      request(path, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(headers as Record<string, string>),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      }),
    delete: (path, headers) =>
      request(path, {
        method: 'DELETE',
        ...(headers ? { headers } : {}),
      }),
  }
}
