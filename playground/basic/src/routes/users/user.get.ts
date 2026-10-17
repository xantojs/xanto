import { GET } from '@xanto/core/server/routing'

export default GET({
  handler(c) {
    return 'Hello World'
  },
})
