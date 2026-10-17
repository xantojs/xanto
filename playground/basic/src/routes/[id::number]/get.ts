import { GET } from '@xanto/core/routing'
import { x } from '@xanto/core/validation'

export default GET({
  schema: {
    params: x.object({
      id: x.number().coerce(),
    }),
  },
  handler(ctx) {
    return {
      message: 'Hello World',
      id: ctx.params.id,
    }
  },
})
