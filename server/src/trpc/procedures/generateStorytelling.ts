import { z } from 'zod'
import { observable } from '@trpc/server/observable'
import { publicProcedure } from '../trpc.js'
import { runStarterAgent } from '../../agents/starter.js'
import { MacroNode } from '../../schemas/macroNode.js'

/**
 * generateStorytelling subscription procedure.
 * 
 * Accepts { prompt: string }, runs ONLY Starter_Agent.
 * Emits StorytellingSSEEvent: progress, complete (with macroNodes), error.
 * 
 * Used by StorytellingsPanel to generate a narrative structure for user review
 * before deck generation.
 */

export type StorytellingSSEEvent =
  | { type: 'progress'; agent: string; message: string }
  | { type: 'complete'; macroNodes: MacroNode[] }
  | { type: 'error'; message: string }

const generateStorytellingInput = z.object({
  prompt: z.string().min(1).max(5000),
})

export const generateStorytellingProcedure = publicProcedure
  .input(generateStorytellingInput)
  .subscription(async ({ input, ctx }) => {
    // Auth check - workspace_id must be present (injected by auth middleware)
    if (!ctx.workspaceId) {
      throw new Error('Unauthorized: workspace_id not found in context')
    }

    return observable<StorytellingSSEEvent>((emit) => {
      const abortController = new AbortController()

      // Run Starter_Agent only
      ;(async () => {
        try {
          // Check for abort before starting
          if (abortController.signal.aborted) {
            emit.next({ type: 'error', message: 'Generation cancelled' })
            emit.complete()
            return
          }

          // Check for GEMINI_API_KEY (skip check if OLLAMA_BASE_URL is set)
          if (!process.env.OLLAMA_BASE_URL && !process.env.GEMINI_API_KEY) {
            emit.next({
              type: 'error',
              message: 'GEMINI_API_KEY or OLLAMA_BASE_URL must be configured',
            })
            emit.complete()
            return
          }

          emit.next({
            type: 'progress',
            agent: 'Starter',
            message: 'Generating storytelling structure...',
          })

          if (abortController.signal.aborted) {
            emit.next({ type: 'error', message: 'Generation cancelled' })
            emit.complete()
            return
          }

          // Run Starter_Agent
          const macroNodes = await runStarterAgent(input.prompt) as MacroNode[]

          // Complete with macroNodes
          emit.next({
            type: 'complete',
            macroNodes,
          })
          emit.complete()
        } catch (error) {
          console.error('generateStorytelling subscription error:', error)
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
