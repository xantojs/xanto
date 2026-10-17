import { GET } from '@xanto/core/server/routing'
import { reply, redirect } from '@xanto/core/server'
import { x } from '@xanto/core/validation'

export default GET({
  schema: {
    query: x.object({
      redirect: x.boolean().coerce(),
    }),
  },
  handler(ctx) {
    if (ctx.query.redirect) {
      return redirect('https://google.com')
    }

    return reply(201, { message: 'done' })
  },
})
