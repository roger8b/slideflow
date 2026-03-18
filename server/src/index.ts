import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS middleware - must be first, before all route handlers
app.use('*', cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
}))

app.get('/', (c) => {
  return c.json({ message: 'Slideflow Backend API' })
})

const server = Bun.serve({
  hostname: '127.0.0.1',
  port: 3000,
  fetch: app.fetch,
})

console.log(`🚀 Server running at http://${server.hostname}:${server.port}`)
