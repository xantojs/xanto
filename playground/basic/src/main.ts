import { createApp } from 'xanto'

const app = createApp()

app.get('/', () => {
  return { message: 'Hello World' }
})

app.start()
