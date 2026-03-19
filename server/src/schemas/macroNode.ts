import { z } from 'zod'

/**
 * MacroNode schema - represents a single slide in the storytelling structure.
 * Produced by Starter_Agent, consumed by Writer_Agent and generateDeckFromStorytelling.
 */

export const macroNodeSchema = z.object({
  title: z.string().max(100),
  type: z.enum(['cover', 'content', 'closing', 'transition']),
  description: z.string().max(500),
})

export type MacroNode = z.infer<typeof macroNodeSchema>
