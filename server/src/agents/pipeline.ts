import { runStarterAgent } from './starter.js'
import { runWriterAgent } from './writer.js'
import { runDesignerAgent } from './designer.js'
import { runReviewerAgent } from './reviewer.js'
import { shouldStop } from './stopChecker.js'
import { CraftJson } from '../schemas/craftJson.js'

/**
 * SSE Event types for real-time streaming to the client.
 */
export type SSEEvent =
  | { type: 'progress'; agent: string; message: string }
  | { type: 'iteration'; slideIndex: number; iteration: number; valid: boolean }
  | { type: 'slide_complete'; slideIndex: number; craftJson: CraftJson }
  | { type: 'complete'; craftJsons: CraftJson[] }
  | { type: 'error'; message: string }

/**
 * Pipeline orchestrator: SequentialAgent → [Starter_Agent, Writer_Agent],
 * then TypeScript SlideLoopAgent iterating over enriched_content[].
 * 
 * For each slide:
 * - Sets current_slide_index
 * - Resets valid/zod_errors
 * - Runs LoopAgent(maxIterations: 3, [Designer_Agent, Reviewer_Agent])
 * - Appends result to craft_jsons[]
 * - Emits slide_complete SSE event
 * 
 * Exports runPipeline(prompt, workspaceId, signal): AsyncGenerator<SSEEvent>
 */

const MAX_LOOP_ITERATIONS = 3

export async function* runPipeline(
  prompt: string,
  workspaceId: string,
  signal: AbortSignal,
  maxSlides?: number
): AsyncGenerator<SSEEvent> {
  try {
    // Check for abort before starting
    if (signal.aborted) {
      yield { type: 'error', message: 'Generation cancelled' }
      return
    }

    // Check for GEMINI_API_KEY (skip check if OLLAMA_BASE_URL is set)
    if (!process.env.OLLAMA_BASE_URL && !process.env.GEMINI_API_KEY) {
      yield { type: 'error', message: 'GEMINI_API_KEY or OLLAMA_BASE_URL must be configured' }
      return
    }

    // Phase 1: Starter_Agent
    yield { type: 'progress', agent: 'Starter', message: 'Generating slide structure...' }
    
    if (signal.aborted) {
      yield { type: 'error', message: 'Generation cancelled' }
      return
    }

    const rawNodes = await runStarterAgent(prompt)
    const macroNodes = maxSlides ? rawNodes.slice(0, maxSlides) : rawNodes

    // Phase 2: Writer_Agent
    yield { type: 'progress', agent: 'Writer', message: 'Enriching content with brand context...' }
    
    if (signal.aborted) {
      yield { type: 'error', message: 'Generation cancelled' }
      return
    }

    const enrichedContent = await runWriterAgent(macroNodes, workspaceId)

    // Phase 3: SlideLoopAgent - iterate over each slide
    const craftJsons: CraftJson[] = []

    for (let slideIndex = 0; slideIndex < enrichedContent.length; slideIndex++) {
      if (signal.aborted) {
        yield { type: 'error', message: 'Generation cancelled' }
        return
      }

      const slide = enrichedContent[slideIndex]
      
      yield {
        type: 'progress',
        agent: 'Designer',
        message: `Designing slide ${slideIndex + 1}/${enrichedContent.length}: ${slide.title}`,
      }

      // LoopAgent: Designer + Reviewer with maxIterations: 3
      let valid = false
      let zodErrors: string | undefined
      let craftJson: CraftJson | null = null
      let iteration = 0

      while (iteration < MAX_LOOP_ITERATIONS && !valid) {
        iteration++

        if (signal.aborted) {
          yield { type: 'error', message: 'Generation cancelled' }
          return
        }

        try {
          // Designer_Agent
          craftJson = await runDesignerAgent(slide, zodErrors)

          // Reviewer_Agent (pure Zod validation)
          const reviewResult = runReviewerAgent(craftJson)
          valid = reviewResult.valid
          zodErrors = reviewResult.zodErrors

          // Emit iteration event
          yield {
            type: 'iteration',
            slideIndex,
            iteration,
            valid,
          }

          // Check stop condition
          if (shouldStop({ valid })) {
            break
          }
        } catch (error) {
          // Timeout or other error - treat as iteration failure
          console.error(`Designer_Agent iteration ${iteration} failed:`, error)
          
          if (iteration >= MAX_LOOP_ITERATIONS) {
            // Circuit breaker exhausted
            yield {
              type: 'error',
              message: `Failed to generate valid layout for slide ${slideIndex + 1} after ${MAX_LOOP_ITERATIONS} attempts`,
            }
            return
          }
          
          // Continue to next iteration
          zodErrors = error instanceof Error ? error.message : 'Unknown error'
        }
      }

      // Circuit breaker check
      if (!valid || !craftJson) {
        yield {
          type: 'error',
          message: `Circuit breaker: Failed to generate valid layout for slide ${slideIndex + 1} after ${MAX_LOOP_ITERATIONS} attempts`,
        }
        return
      }

      // Slide complete
      craftJsons.push(craftJson)
      yield {
        type: 'slide_complete',
        slideIndex,
        craftJson,
      }
    }

    // All slides complete
    yield {
      type: 'complete',
      craftJsons,
    }
  } catch (error) {
    console.error('Pipeline error:', error)
    yield {
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown pipeline error',
    }
  }
}
