import { Context } from 'hono'

/**
 * tRPC context type.
 * Injected by auth middleware with userId and workspaceId from Better-Auth session.
 */
export interface TRPCContext {
  userId?: string
  workspaceId?: string
  req: Context
}

export function createContext(c: Context): TRPCContext {
  return {
    req: c,
  }
}
