import { GET } from '@xanto/core/routing'

export default GET({
  handler(ctx) {
    return {
      message: 'Catch-all route',
      slug: ctx.params.slug,
    }
  },
})
