import { GET } from '@xanto/core/routing'

export default GET({
    handler(ctx) {
       return ctx.redirect('https://google.com')
    }
})