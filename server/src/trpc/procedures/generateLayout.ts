import { z } from 'zod'
import { observable } from '@trpc/server/observable'
import { publicProcedure } from '../trpc.js'
import { runPipeline, SSEEvent } from '../../agents/pipeline.js'

/**
 * generateLayout subscription procedure.
 * Accepts { prompt: string }, reads workspace_id from context,
 * runs pipeline, yields typed SSEEvent discriminated union.
 * 
 * Creates AbortController per subscription; passes signal to runPipeline;
 * calls abort() on client disconnect.
 */

const generateLayoutInput = z.object({
  prompt: z.string().min(1).max(2000),
  maxSlides: z.number().int().min(1).max(10).optional(),
})

export const generateLayoutProcedure = publicProcedure
  .input(generateLayoutInput)
  .subscription(async ({ input, ctx }) => {
    // Auth check - workspace_id must be present (injected by auth middleware)
    if (!ctx.workspaceId) {
      throw new Error('Unauthorized: workspace_id not found in context')
    }

    return observable<SSEEvent>((emit) => {
      const abortController = new AbortController()

      // Run pipeline and emit events
      ;(async () => {
        try {
          for await (const event of runPipeline(
            input.prompt,
            ctx.workspaceId!,
            abortController.signal,
            input.maxSlides
          )) {
            emit.next(event)

            // Close on complete or error
            if (event.type === 'complete' || event.type === 'error') {
              emit.complete()
              break
            }
          }
        } catch (error) {
          console.error('generateLayout subscription error:', error)
          emit.next({
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          })
          emit.complete()
        }
      })()

      // Cleanup on unsubscribe (client disconnect)
      return () => {
        abortController.abort()
      }
    })
  })
