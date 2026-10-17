export function reply(status: number, body?: unknown): Response {
  return body === undefined ? new Response(null, { status }) : Response.json(body, { status })
}

export function redirect(location: string, status: 301 | 302 | 303 | 307 | 308 = 302): Response {
  return new Response(null, { status, headers: { location } })
}
