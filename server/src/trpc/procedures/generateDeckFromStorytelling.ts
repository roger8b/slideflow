import { z } from 'zod'
import { observable } from '@trpc/server/observable'
import { publicProcedure } from '../trpc.js'
import { runWriterAgent } from '../../agents/writer.js'
import { runDesignerAgent } from '../../agents/designer.js'
import { runReviewerAgent } from '../../agents/reviewer.js'
import { shouldStop } from '../../agents/stopChecker.js'
import { macroNodeSchema } from '../../schemas/macroNode.js'
import { SSEEvent } from '../../agents/pipeline.js'
import { CraftJson } from '../../schemas/craftJson.js'

/**
 * generateDeckFromStorytelling subscription procedure.
 * 
 * Accepts { macroNodes: MacroNode[] } — skips Starter_Agent, starts from Writer_Agent.
 * Wire into pipeline: Writer_Agent (brand kit RAG lookup) → SlideLoopAgent × N slides.
 * Emits full SSEEvent set: progress, iteration, slide_complete, complete, error.
 * 
 * Used by StorytellingsPanel when user clicks "Generate Deck" on a saved storytelling.
 */

const generateDeckFromStorytellingInput = z.object({
  macroNodes: z.array(macroNodeSchema).min(1).max(20),
})

const MAX_LOOP_ITERATIONS = 3

export const generateDeckFromStorytellingProcedure = publicProcedure
  .input(generateDeckFromStorytellingInput)
  .subscription(async ({ input, ctx }) => {
    // Auth check - workspace_id must be present (injected by auth middleware)
    if (!ctx.workspaceId) {
      throw new Error('Unauthorized: workspace_id not found in context')
    }

    return observable<SSEEvent>((emit) => {
      const abortController = new AbortController()

      // Run pipeline starting from Writer_Agent
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

          // Phase 1: Writer_Agent (with Brand Kit RAG lookup)
          emit.next({
            type: 'progress',
            agent: 'Writer',
            message: 'Enriching content with brand context...',
          })

          if (abortController.signal.aborted) {
            emit.next({ type: 'error', message: 'Generation cancelled' })
            emit.complete()
            return
          }

          // Type assertion: input.macroNodes is validated by Zod schema
          const enrichedContent = await runWriterAgent(input.macroNodes as any, ctx.workspaceId!)

          // Phase 2: SlideLoopAgent - iterate over each slide
          const craftJsons: CraftJson[] = []

          for (let slideIndex = 0; slideIndex < enrichedContent.length; slideIndex++) {
            if (abortController.signal.aborted) {
              emit.next({ type: 'error', message: 'Generation cancelled' })
              emit.complete()
              return
            }

            const slide = enrichedContent[slideIndex]

            emit.next({
              type: 'progress',
              agent: 'Designer',
              message: `Designing slide ${slideIndex + 1}/${enrichedContent.length}: ${slide.title}`,
            })

            // LoopAgent: Designer + Reviewer with maxIterations: 3
            let valid = false
            let zodErrors: string | undefined
            let craftJson: CraftJson | null = null
            let iteration = 0

            while (iteration < MAX_LOOP_ITERATIONS && !valid) {
              iteration++

              if (abortController.signal.aborted) {
                emit.next({ type: 'error', message: 'Generation cancelled' })
                emit.complete()
                return
              }

              try {
                // Designer_Agent
                craftJson = await runDesignerAgent(slide, 'full', zodErrors)

                // Reviewer_Agent (pure Zod validation)
                const reviewResult = runReviewerAgent(craftJson)
                valid = reviewResult.valid
                zodErrors = reviewResult.zodErrors

                // Emit iteration event
                emit.next({
                  type: 'iteration',
                  slideIndex,
                  iteration,
                  valid,
                })

                // Check stop condition
                if (shouldStop({ valid })) {
                  break
                }
              } catch (error) {
                // Timeout or other error - treat as iteration failure
                console.error(`Designer_Agent iteration ${iteration} failed:`, error)

                if (iteration >= MAX_LOOP_ITERATIONS) {
                  // Circuit breaker exhausted
                  emit.next({
                    type: 'error',
                    message: `Failed to generate valid layout for slide ${slideIndex + 1} after ${MAX_LOOP_ITERATIONS} attempts`,
                  })
                  emit.complete()
                  return
                }

                // Continue to next iteration
                zodErrors = error instanceof Error ? error.message : 'Unknown error'
              }
            }

            // Circuit breaker check
            if (!valid || !craftJson) {
              emit.next({
                type: 'error',
                message: `Circuit breaker: Failed to generate valid layout for slide ${slideIndex + 1} after ${MAX_LOOP_ITERATIONS} attempts`,
              })
              emit.complete()
              return
            }

            // Slide complete
            craftJsons.push(craftJson)
            emit.next({
              type: 'slide_complete',
              slideIndex,
              craftJson,
            })
          }

          // All slides complete
          emit.next({
            type: 'complete',
            craftJsons,
          })
          emit.complete()
        } catch (error) {
          console.error('generateDeckFromStorytelling subscription error:', error)
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
