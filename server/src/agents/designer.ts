import { ai } from '../lib/ai.js'
import { CraftJson } from '../schemas/craftJson.js'
import { randomUUID } from 'crypto'

/**
 * Designer_Agent: LlmAgent inside the LoopAgent that generates Craft.js-compatible JSON layouts.
 * Converts enriched_content[current_slide_index] to CraftJson for one slide.
 * Assigns each node id = crypto.randomUUID().
 * Wraps Gemini call in Promise.race with timeout - on timeout, throws error treated as iteration failure.
 */

interface EnrichedSlide {
  title: string
  content: string
  brandContext: any
}

const LLM_CALL_TIMEOUT_MS = parseInt(process.env.LLM_CALL_TIMEOUT_MS || '60000', 10)

const DESIGNER_PROMPT = `You are a presentation layout designer. Generate a Craft.js-compatible JSON layout for a single slide using FLEXBOX layout.

Slide content:
Title: {{title}}
Key points:
{{content}}

Brand context (use these exact color/font values in the JSON):
{{brand_context}}

════════════════════════════════════════
LAYOUT MODEL — CRITICAL RULES
════════════════════════════════════════
1. FLEXBOX ONLY. NEVER put x, y, width (as fixed pixels), or height on Title, Text, or Icon nodes.
   Layout is controlled exclusively by PARENT Container props.
2. Every Container must have: display, flexDirection, alignItems, justifyContent, background, padding, gap, width, height.
3. ROOT Container: width must be "100%", height must be "100%".
4. Use "background" (NOT "backgroundColor") for all color fills.
5. Width/height values: use "100%", "auto", "Npx" strings, or plain numbers (e.g. 56 means 56px all sides).
6. Use actual hex color values from brand context. NEVER use placeholder strings like {{primary}}.
7. Canvas is 960×540px — keep content minimal, max 4 items per slide.

════════════════════════════════════════
COMPONENT PROPS REFERENCE
════════════════════════════════════════
Container (isCanvas: true):
  display, flexDirection, alignItems, justifyContent
  background, padding, gap, width, height
  borderRadius, boxShadow, borderWidth, borderColor
  flex, flexShrink, gridTemplateColumns, margin, alignSelf

Title (isCanvas: false):
  text, fontSize, color, textAlign, fontWeight, background

Text (isCanvas: false):
  text, fontSize, color, textAlign, fontWeight, lineHeight

Icon (isCanvas: false):
  name (lucide icon name), size, color, strokeWidth, background, padding, borderRadius

Image (isCanvas: false):
  src, alt, width, height, borderRadius

════════════════════════════════════════
NODE ID RULES
════════════════════════════════════════
- ROOT node key must be the literal string "ROOT"
- All other node IDs: use semantic names like "title_1", "container_2", "text_3"
- Every non-ROOT node MUST have a "parent" field with the parent node ID
- Every ID listed in any "nodes" array MUST exist as a key in the JSON

════════════════════════════════════════
EXAMPLE — title + accent line + bullet list
════════════════════════════════════════
{
  "ROOT": {
    "type": { "resolvedName": "Container" },
    "isCanvas": true,
    "props": {
      "display": "flex", "flexDirection": "column",
      "alignItems": "flex-start", "justifyContent": "center",
      "background": "#F8F5F1", "padding": 56, "gap": 16,
      "width": "100%", "height": "100%",
      "borderRadius": 0, "boxShadow": "none", "borderWidth": 0
    },
    "displayName": "Container", "custom": {}, "hidden": false,
    "nodes": ["title_1", "accent_2", "row_3", "row_4"],
    "linkedNodes": {}
  },
  "title_1": {
    "type": { "resolvedName": "Title" }, "isCanvas": false,
    "props": { "text": "Slide Title", "fontSize": 40, "color": "#141414", "textAlign": "left", "fontWeight": "bold" },
    "displayName": "Title", "custom": {}, "parent": "ROOT", "hidden": false, "nodes": [], "linkedNodes": {}
  },
  "accent_2": {
    "type": { "resolvedName": "Container" }, "isCanvas": true,
    "props": {
      "display": "flex", "flexDirection": "column", "alignItems": "flex-start", "justifyContent": "flex-start",
      "background": "#3B82F6", "padding": 0, "gap": 0,
      "width": "40px", "height": "3px", "borderRadius": 2, "margin": "8px 0 16px 0"
    },
    "displayName": "Container", "custom": {}, "parent": "ROOT", "hidden": false, "nodes": [], "linkedNodes": {}
  },
  "row_3": {
    "type": { "resolvedName": "Container" }, "isCanvas": true,
    "props": {
      "display": "flex", "flexDirection": "row", "alignItems": "flex-start", "justifyContent": "flex-start",
      "background": "transparent", "padding": "6px 0", "gap": 14, "width": "100%", "height": "auto"
    },
    "displayName": "Container", "custom": {}, "parent": "ROOT", "hidden": false,
    "nodes": ["bullet_3a", "text_3b"], "linkedNodes": {}
  },
  "bullet_3a": {
    "type": { "resolvedName": "Container" }, "isCanvas": true,
    "props": {
      "display": "flex", "flexDirection": "column", "alignItems": "flex-start", "justifyContent": "flex-start",
      "background": "#3B82F6", "padding": 0, "gap": 0,
      "width": "28px", "height": "2px", "borderRadius": 3, "margin": "11px 0 0 0", "flexShrink": "0"
    },
    "displayName": "Container", "custom": {}, "parent": "row_3", "hidden": false, "nodes": [], "linkedNodes": {}
  },
  "text_3b": {
    "type": { "resolvedName": "Text" }, "isCanvas": false,
    "props": { "text": "First key point goes here concisely.", "fontSize": 17, "color": "#5C5C5C", "textAlign": "left" },
    "displayName": "Text", "custom": {}, "parent": "row_3", "hidden": false, "nodes": [], "linkedNodes": {}
  },
  "row_4": {
    "type": { "resolvedName": "Container" }, "isCanvas": true,
    "props": {
      "display": "flex", "flexDirection": "row", "alignItems": "flex-start", "justifyContent": "flex-start",
      "background": "transparent", "padding": "6px 0", "gap": 14, "width": "100%", "height": "auto"
    },
    "displayName": "Container", "custom": {}, "parent": "ROOT", "hidden": false,
    "nodes": ["bullet_4a", "text_4b"], "linkedNodes": {}
  },
  "bullet_4a": {
    "type": { "resolvedName": "Container" }, "isCanvas": true,
    "props": {
      "display": "flex", "flexDirection": "column", "alignItems": "flex-start", "justifyContent": "flex-start",
      "background": "#3B82F6", "padding": 0, "gap": 0,
      "width": "28px", "height": "2px", "borderRadius": 3, "margin": "11px 0 0 0", "flexShrink": "0"
    },
    "displayName": "Container", "custom": {}, "parent": "row_4", "hidden": false, "nodes": [], "linkedNodes": {}
  },
  "text_4b": {
    "type": { "resolvedName": "Text" }, "isCanvas": false,
    "props": { "text": "Second key point goes here concisely.", "fontSize": 17, "color": "#5C5C5C", "textAlign": "left" },
    "displayName": "Text", "custom": {}, "parent": "row_4", "hidden": false, "nodes": [], "linkedNodes": {}
  }
}

{{zod_errors}}

CRITICAL: Return ONLY the JSON object. No markdown code blocks. No additional text.`

function assignUUIDs(craftJson: any): CraftJson {
  const result: CraftJson = {}
  const idMap = new Map<string, string>()

  // First pass: create UUID mapping for all nodes
  for (const [oldId] of Object.entries(craftJson)) {
    const newId = oldId === 'ROOT' ? 'ROOT' : randomUUID()
    idMap.set(oldId, newId)
  }

  // Second pass: replace all IDs
  for (const [oldId, nodeValue] of Object.entries(craftJson)) {
    const newId = idMap.get(oldId)!
    const node = nodeValue as any
    const newNode = { ...node }

    // Replace parent ID
    if (newNode.parent && idMap.has(newNode.parent)) {
      newNode.parent = idMap.get(newNode.parent)
    }

    // Replace nodes array IDs
    if (newNode.nodes && Array.isArray(newNode.nodes)) {
      newNode.nodes = newNode.nodes.map((childId: string) => idMap.get(childId) || childId)
    }

    // Replace linkedNodes IDs
    if (newNode.linkedNodes) {
      const newLinkedNodes: Record<string, string> = {}
      for (const [key, linkedId] of Object.entries(newNode.linkedNodes)) {
        newLinkedNodes[key] = idMap.get(linkedId as string) || (linkedId as string)
      }
      newNode.linkedNodes = newLinkedNodes
    }

    result[newId] = newNode
  }

  return result
}

export async function runDesignerAgent(
  slide: EnrichedSlide,
  zodErrors?: string
): Promise<CraftJson> {
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'

  const zodErrorSection = zodErrors
    ? `\nPREVIOUS VALIDATION ERRORS:\n${zodErrors}\n\nPlease fix these errors in your layout.`
    : ''

  const prompt = DESIGNER_PROMPT
    .replace('{{title}}', slide.title)
    .replace('{{content}}', slide.content)
    .replace('{{brand_context}}', JSON.stringify(slide.brandContext, null, 2))
    .replace('{{zod_errors}}', zodErrorSection)

  // Wrap LLM call with timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('LLM call timeout')), LLM_CALL_TIMEOUT_MS)
  })

  try {
    const result = await Promise.race([
      ai.generate({
        model: modelName,
        prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
      timeoutPromise,
    ])

    const content = result.text

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON object found in response')
    }

    const craftJson = JSON.parse(jsonMatch[0])

    // Assign UUIDs to all nodes
    return assignUUIDs(craftJson)
  } catch (error) {
    if (error instanceof Error && error.message === 'LLM call timeout') {
      console.error('Designer_Agent timeout after', LLM_CALL_TIMEOUT_MS, 'ms')
      throw error
    }
    console.error('Failed to parse Designer_Agent response:', error)
    throw new Error('Invalid JSON response from Designer_Agent')
  }
}
