import { z } from 'zod'

/**
 * Canvas_Schema validates the structural integrity of Craft.js flexbox layouts.
 *
 * Layout model: flexbox/grid via nested Containers. Leaf nodes (Title, Text, Icon)
 * do NOT use absolute x/y/width/height positioning — layout is controlled by
 * parent Container props (display, flexDirection, gap, padding, etc.).
 *
 * Validates:
 * - ROOT exists and is a Container with isCanvas: true
 * - All node IDs referenced in "nodes" arrays exist as keys in the object
 * - All "parent" references point to existing nodes
 * - Required Craft.js structural fields are present on every node
 */

const allowedComponents = z.enum(['Container', 'Title', 'Text', 'Image', 'Icon'])

const craftNodeSchema = z.object({
  type: z.object({
    resolvedName: allowedComponents,
  }),
  isCanvas: z.boolean().optional(),
  props: z.object({}).passthrough(),
  displayName: z.string(),
  custom: z.object({}).passthrough(),
  parent: z.string().optional(),
  hidden: z.boolean().optional(),
  nodes: z.array(z.string()).optional(),
  linkedNodes: z.record(z.string()).optional(),
})

const rootNodeSchema = z.object({
  type: z.object({
    resolvedName: z.literal('Container'),
  }),
  isCanvas: z.literal(true),
  props: z.object({}).passthrough(),
  displayName: z.string(),
  custom: z.object({}).passthrough(),
  hidden: z.boolean().optional(),
  nodes: z.array(z.string()),
  linkedNodes: z.record(z.string()).optional(),
})

export const canvasSchema = z
  .object({ ROOT: rootNodeSchema })
  .catchall(craftNodeSchema)
  .superRefine((data, ctx) => {
    const allIds = new Set(Object.keys(data))

    for (const [nodeId, node] of Object.entries(data)) {
      // Validate all children referenced in "nodes" exist
      const children = (node as any).nodes ?? []
      for (const childId of children) {
        if (!allIds.has(childId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Node "${nodeId}" references child "${childId}" which does not exist in the layout`,
          })
        }
      }

      // Validate parent references exist (non-ROOT nodes)
      if (nodeId !== 'ROOT') {
        const parent = (node as any).parent
        if (parent && !allIds.has(parent)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Node "${nodeId}" has parent "${parent}" which does not exist in the layout`,
          })
        }
      }
    }
  })

export type CanvasNode = z.infer<typeof canvasSchema>
