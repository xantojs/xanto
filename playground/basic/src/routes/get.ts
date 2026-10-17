import { GET } from '@xanto/core/server/routing'

export default GET({
  handler(ctx) {
    return "Hello World"
  }
})