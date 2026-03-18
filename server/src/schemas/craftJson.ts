import { z } from 'zod'

/**
 * Zod types for Craft.js node structure.
 * Matches the serialized format used by Craft.js editor.
 */

export const craftNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.object({
      resolvedName: z.string(),
    }),
    isCanvas: z.boolean().optional(),
    props: z.record(z.any()),
    displayName: z.string(),
    custom: z.record(z.any()),
    parent: z.string().optional(),
    hidden: z.boolean().optional(),
    nodes: z.array(z.string()).optional(),
    linkedNodes: z.record(z.string()).optional(),
  })
)

export const craftJsonSchema = z.record(craftNodeSchema)

export type CraftNode = z.infer<typeof craftNodeSchema>
export type CraftJson = z.infer<typeof craftJsonSchema>
