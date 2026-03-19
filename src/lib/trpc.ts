import { createTRPCClient, httpBatchLink, splitLink, unstable_httpSubscriptionLink } from '@trpc/client'
import type { AppRouter } from '../../server/src/trpc/router'

/**
 * tRPC client for frontend.
 * Connects to backend at http://localhost:3000/trpc
 */

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:3000'

export const trpc = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: unstable_httpSubscriptionLink({
        url: `${BACKEND_URL}/trpc`,
        connectionParams: () => ({
          // TODO: Replace with Better-Auth session in FA 004
          // For now, use mock headers for testing
          'X-User-Id': 'test-user',
          'X-Workspace-Id': 'test-workspace',
        }),
      }),
      false: httpBatchLink({
        url: `${BACKEND_URL}/trpc`,
        headers: () => ({
          // TODO: Replace with Better-Auth session in FA 004
          'X-User-Id': 'test-user',
          'X-Workspace-Id': 'test-workspace',
        }),
      }),
    }),
  ],
})
