import { GET } from '@xanto/core/server/routing'

export default GET({
  handler(ctx) {
    return {
      message: 'Catch-all route',
      slug: ctx.params.slug,
    }
  },
})
