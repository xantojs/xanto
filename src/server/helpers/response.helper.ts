export function reply(status: number, body?: unknown): Response {
  if (body === undefined || body === null) return new Response(null, { status })
  if (typeof body === 'string') {
    return new Response(body, {
      status,
      headers: {
        'content-type': 'text/plain; charset=UTF-8',
        'content-length': String(new TextEncoder().encode(body).length),
      },
    })
  }
  if (body instanceof Blob || body instanceof ReadableStream || body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    return new Response(body as BodyInit, { status })
  }
  return Response.json(body, { status })
}

export function redirect(location: string, status: 301 | 302 | 303 | 307 | 308 = 302): Response {
  return new Response(null, { status, headers: { location } })
}
