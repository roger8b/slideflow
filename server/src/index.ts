import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from './trpc/router.js'
import { createContext } from './trpc/context.js'
import { injectAuthContext } from './middleware/auth.js'
import { rateLimiter } from './middleware/rateLimiter.js'

const app = new Hono()

// CORS middleware - must be first, before all route handlers
app.use('*', cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
}))

// Rate limiter for tRPC routes
app.use('/trpc/*', rateLimiter)

// Mount tRPC handler at /trpc
app.all('/trpc/*', async (c) => {
  const path = c.req.path.replace(/^\/trpc\/?/, '')
  
  return fetchRequestHandler({
    endpoint: '/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext: () => {
      const ctx = createContext(c)
      // Inject auth context (validates session and adds userId/workspaceId)
      return injectAuthContext(ctx)
    },
  })
})

app.get('/', (c) => {
  return c.json({ message: 'Slideflow Backend API' })
})

const server = Bun.serve({
  hostname: '127.0.0.1',
  port: 3000,
  fetch: app.fetch,
  // Increase idle timeout for long-running LLM generation (SSE streams)
  // Default is 10s, but AI generation can take 60-120s depending on model and slide count
  // Maximum allowed by Bun is 255 seconds (~4 minutes)
  idleTimeout: 255,
})

console.log(`🚀 Server running at http://${server.hostname}:${server.port}`)
