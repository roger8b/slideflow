import { z } from 'zod'
import { observable } from '@trpc/server/observable'
import { publicProcedure } from '../trpc.js'
import { runSlideStorywriterAgent } from '../../agents/slideStorywriter.js'
import { runDesignerAgent } from '../../agents/designer.js'
import { runReviewerAgent } from '../../agents/reviewer.js'
import { shouldStop } from '../../agents/stopChecker.js'
import { CraftJson } from '../../schemas/craftJson.js'
import { db } from '../../db/client.js'
import { brandKits, workspaceDefaults, globalDefaults } from '../../db/schema.js'
import { eq, and, desc } from 'drizzle-orm'

/**
 * generateSlide subscription procedure (single-slide mode).
 * 
 * Accepts { prompt: string, context?: string }.
 * Pipeline: SlideStorywriter_Agent → Designer_Agent → Reviewer_Agent (loop, maxIterations: 3).
 * 
 * Before pipeline: performs Brand Kit RAG lookup (5-level fallback) and writes to session state.
 * If hardcoded defaults used: emits 'notice' SSE event.
 * 
 * Emits SingleSlideSSEEvent: progress, notice (optional), iteration (no slideIndex), complete (single craftJson, not array), error.
 * Applies same AbortController pattern and LLM_CALL_TIMEOUT_MS guard as generateLayout.
 */

export type SingleSlideSSEEvent =
  | { type: 'progress'; agent: string; message: string }
  | { type: 'notice'; message: string }
  | { type: 'iteration'; iteration: number; valid: boolean }
  | { type: 'complete'; craftJson: CraftJson }
  | { type: 'error'; message: string }

const generateSlideInput = z.object({
  prompt: z.string().min(1).max(2000),
  context: z.string().max(5000).optional(),
})

const MAX_LOOP_ITERATIONS = 3

/**
 * Brand Kit RAG lookup with 5-level fallback chain.
 * Same pattern as Writer_Agent.
 * Returns { brandContext, usedHardcodedDefaults }
 */
async function getBrandKitWithFallback(workspaceId: string): Promise<{
  brandContext: any
  usedHardcodedDefaults: boolean
}> {
  // Level 1: Active brand kit
  const activeBrandKit = await db
    .select()
    .from(brandKits)
    .where(and(eq(brandKits.workspaceId, workspaceId), eq(brandKits.isActive, true)))
    .limit(1)

  if (activeBrandKit.length > 0) {
    return {
      brandContext: JSON.parse(activeBrandKit[0].tokens),
      usedHardcodedDefaults: false,
    }
  }

  // Level 2: Most recent brand kit
  const recentBrandKit = await db
    .select()
    .from(brandKits)
    .where(eq(brandKits.workspaceId, workspaceId))
    .orderBy(desc(brandKits.createdAt))
    .limit(1)

  if (recentBrandKit.length > 0) {
    return {
      brandContext: JSON.parse(recentBrandKit[0].tokens),
      usedHardcodedDefaults: false,
    }
  }

  // Level 3: Workspace defaults
  const workspaceDefault = await db
    .select()
    .from(workspaceDefaults)
    .where(and(eq(workspaceDefaults.workspaceId, workspaceId), eq(workspaceDefaults.type, 'theme')))
    .limit(1)

  if (workspaceDefault.length > 0) {
    return {
      brandContext: JSON.parse(workspaceDefault[0].data),
      usedHardcodedDefaults: false,
    }
  }

  // Level 4: Global defaults
  const globalDefault = await db
    .select()
    .from(globalDefaults)
    .where(eq(globalDefaults.type, 'theme'))
    .limit(1)

  if (globalDefault.length > 0) {
    return {
      brandContext: JSON.parse(globalDefault[0].data),
      usedHardcodedDefaults: false,
    }
  }

  // Level 5: Hardcoded defaults
  return {
    brandContext: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      fontHeading: 'Inter',
      fontBody: 'Inter',
    },
    usedHardcodedDefaults: true,
  }
}

export const generateSlideProcedure = publicProcedure
  .input(generateSlideInput)
  .subscription(async ({ input, ctx }) => {
    // Auth check - workspace_id must be present (injected by auth middleware)
    if (!ctx.workspaceId) {
      throw new Error('Unauthorized: workspace_id not found in context')
    }

    return observable<SingleSlideSSEEvent>((emit) => {
      const abortController = new AbortController()

      // Run single-slide generation pipeline
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

          // Brand Kit RAG lookup (5-level fallback)
          const { brandContext, usedHardcodedDefaults } = await getBrandKitWithFallback(
            ctx.workspaceId
          )

          // Emit notice if hardcoded defaults were used
          if (usedHardcodedDefaults) {
            emit.next({
              type: 'notice',
              message:
                'Using default brand palette. You can customize colors and fonts in Brand Kit settings.',
            })
          }

          // Step 1: SlideStorywriter_Agent - structure the content
          emit.next({
            type: 'progress',
            agent: 'SlideStorywriter',
            message: 'Structuring slide content...',
          })

          console.log('Calling SlideStorywriter_Agent...')
          const singleSlideContent = await runSlideStorywriterAgent(
            input.prompt,
            input.context,
            brandContext
          )
          console.log('SlideStorywriter_Agent completed:', JSON.stringify(singleSlideContent, null, 2))

          // Step 2: LoopAgent - Designer + Reviewer with maxIterations: 3
          emit.next({
            type: 'progress',
            agent: 'Designer',
            message: 'Designing slide layout...',
          })

          console.log('Starting Designer + Reviewer loop...')
          let valid = false
          let zodErrors: string | undefined
          let craftJson: CraftJson | null = null
          let iteration = 0

          while (iteration < MAX_LOOP_ITERATIONS && !valid) {
            iteration++
            console.log(`Loop iteration ${iteration}/${MAX_LOOP_ITERATIONS}`)

            if (abortController.signal.aborted) {
              emit.next({ type: 'error', message: 'Generation cancelled' })
              emit.complete()
              return
            }

            try {
              console.log('Calling Designer_Agent...')
              // Designer_Agent - pass structured content from SlideStorywriter
              craftJson = await runDesignerAgent(
                { singleSlideContent, brandContext },
                'single',
                zodErrors
              )
              console.log('Designer_Agent completed')

              console.log('Calling Reviewer_Agent...')
              // Reviewer_Agent (pure Zod validation)
              const reviewResult = runReviewerAgent(craftJson)
              valid = reviewResult.valid
              zodErrors = reviewResult.zodErrors
              console.log('Reviewer_Agent completed:', { valid, zodErrors })

              // Emit iteration event
              emit.next({
                type: 'iteration',
                iteration,
                valid,
              })

              // Check stop condition
              if (shouldStop({ valid })) {
                console.log('Stop condition met, exiting loop')
                break
              }
            } catch (error) {
              // Timeout or other error - treat as iteration failure
              console.error(`Designer_Agent iteration ${iteration} failed:`, error)

              if (iteration >= MAX_LOOP_ITERATIONS) {
                // Circuit breaker exhausted
                emit.next({
                  type: 'error',
                  message: `Failed to generate valid layout after ${MAX_LOOP_ITERATIONS} attempts`,
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
              message: `Circuit breaker: Failed to generate valid layout after ${MAX_LOOP_ITERATIONS} attempts`,
            })
            emit.complete()
            return
          }

          // Slide complete
          emit.next({
            type: 'complete',
            craftJson,
          })
          emit.complete()
        } catch (error) {
          console.error('generateSlide subscription error:', error)
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
