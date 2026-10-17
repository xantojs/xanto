import { GET } from '@xanto/core/server/routing'

export default GET({
    handler(ctx) {
       return ctx.redirect('https://google.com')
    }
})