import { TRPCContext } from '../trpc/context.js'

/**
 * Auth middleware for tRPC.
 * Reads Better-Auth session cookie, injects { userId, workspaceId } into tRPC context.
 * Returns HTTP 401 on missing/invalid session.
 * 
 * NOTE: This is a placeholder implementation until Better-Auth is integrated in FA 004.
 * For FA 002 testing, we'll use a mock workspace_id from headers.
 */

export function injectAuthContext(ctx: TRPCContext): TRPCContext {
  // TODO: Replace with Better-Auth session validation in FA 004
  // Try HTTP headers first (httpBatchLink), then connectionParams query param (SSE subscriptions)
  let workspaceId = ctx.req.req.header('X-Workspace-Id')
  let userId = ctx.req.req.header('X-User-Id')

  if (!workspaceId || !userId) {
    // SSE subscriptions send connectionParams as a JSON-encoded URL query parameter
    const raw = new URL(ctx.req.req.url).searchParams.get('connectionParams')
    if (raw) {
      try {
        const params = JSON.parse(raw) as Record<string, string>
        workspaceId = workspaceId ?? params['X-Workspace-Id']
        userId = userId ?? params['X-User-Id']
      } catch {
        // ignore malformed connectionParams
      }
    }
  }

  if (!workspaceId || !userId) {
    throw new Error('Unauthorized: Missing auth headers')
  }

  return {
    ...ctx,
    userId,
    workspaceId,
  }
}
