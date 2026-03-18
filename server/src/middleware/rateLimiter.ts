import { Context, Next } from 'hono'

/**
 * Rate limiter middleware: sliding window per workspace.
 * Limit configurable via RATE_LIMIT_REQUESTS_PER_HOUR env var.
 * Returns HTTP 429 + Retry-After header when limit exceeded.
 */

interface RateLimitEntry {
  count: number
  windowStart: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()
const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const DEFAULT_LIMIT = 100

function getRateLimit(): number {
  const limit = process.env.RATE_LIMIT_REQUESTS_PER_HOUR
  return limit ? parseInt(limit, 10) : DEFAULT_LIMIT
}

export async function rateLimiter(c: Context, next: Next) {
  const workspaceId = c.req.header('X-Workspace-Id')

  if (!workspaceId) {
    // No workspace ID - skip rate limiting (will be caught by auth)
    await next()
    return
  }

  const now = Date.now()
  const limit = getRateLimit()
  const entry = rateLimitStore.get(workspaceId)

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    // New window
    rateLimitStore.set(workspaceId, {
      count: 1,
      windowStart: now,
    })
    await next()
    return
  }

  if (entry.count >= limit) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000)
    return c.json(
      { error: 'Rate limit exceeded' },
      429,
      {
        'Retry-After': retryAfter.toString(),
      }
    )
  }

  // Increment count
  entry.count++
  await next()
}
