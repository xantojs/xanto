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

export default GET<MyState>({
  schema: {
    query: x.object({
      id: x.number().coerce(),
      user: x.string().min(3),
    }),
  },
  handler(ctx) {
    ctx.status(HttpStatus.Ok)

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

    const userId = ctx.state.get('userId')

    return userId
  },
})
