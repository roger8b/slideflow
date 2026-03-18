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
  // For now, read from X-Workspace-Id header for testing
  const workspaceId = ctx.req.req.header('X-Workspace-Id')
  const userId = ctx.req.req.header('X-User-Id')

  if (!workspaceId || !userId) {
    throw new Error('Unauthorized: Missing auth headers')
  }

  return {
    ...ctx,
    userId,
    workspaceId,
  }
}
