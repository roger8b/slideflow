import { canvasSchema } from '../schemas/canvas.js'
import { CraftJson } from '../schemas/craftJson.js'

/**
 * Reviewer_Agent: Pure TypeScript validation function (NOT an LlmAgent).
 * Runs canvasSchema.safeParse(craftJson) deterministically.
 * On failure: writes zod_errors to session state and sets valid = false.
 * On success: sets valid = true.
 * No LLM call - executes at zero token cost.
 */

export interface ReviewResult {
  valid: boolean
  zodErrors?: string
}

export function runReviewerAgent(craftJson: CraftJson): ReviewResult {
  const result = canvasSchema.safeParse(craftJson)

  if (!result.success) {
    // Format Zod errors for Designer_Agent to consume
    const errorMessages = result.error.errors
      .map((err) => `- ${err.path.join('.')}: ${err.message}`)
      .join('\n')

    return {
      valid: false,
      zodErrors: errorMessages,
    }
  }

  return {
    valid: true,
  }
}
