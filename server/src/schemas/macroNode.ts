import { z } from 'zod'

/**
 * MacroNode schema - represents a single slide in the storytelling structure.
 * Produced by Starter_Agent, consumed by Writer_Agent and generateDeckFromStorytelling.
 */

export const macroNodeSchema = z.object({
  title: z.string().max(100),
  purpose: z.string().max(500),
  key_points: z.array(z.string()).min(2).max(5),
})

export type MacroNode = z.infer<typeof macroNodeSchema>
