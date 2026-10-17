import { GET } from '@xanto/core/server/routing'
import { redirect } from '@xanto/core/server'

export default GET({
    handler(ctx) {
       return redirect('https://google.com')
    }
})