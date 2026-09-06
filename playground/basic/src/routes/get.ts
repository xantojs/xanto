import { GET } from '@xanto/core/routing'
import { x } from '@xanto/core/validation'

import { HttpStatus } from '@xanto/core'

interface Users {
  name: string
  age: number
}

interface MyState {
  userId: number
  users: Users[]
}

export default GET({
  schema: {
    query: x.object({
      id: x.number().coerce(),
      user: x.string().min(3),
    }),
    state: x.object({
      userId: x.number(),
      users: x.array(
        x.object({
          name: x.string(),
          age: x.number(),
        })
      ),
    }),
  },
  handler(ctx) {
    ctx.status(HttpStatus.Ok)

    ctx.query.id

    ctx.state.set('userId', 213123)

    ctx.state.set('users', [
      {
        name: 'e',
        age: 1,
      },
      {
        name: 'quarnel',
        age: 0o0,
      },
    ])

    const userId = ctx.state.get<number>('userId')

    return userId
  },
})
