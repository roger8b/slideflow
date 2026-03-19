import { ai, resolveModel } from '../lib/ai.js'
import { db } from '../db/client.js'
import { brandKits, workspaceDefaults, globalDefaults } from '../db/schema.js'
import { eq, and, desc } from 'drizzle-orm'

/**
 * Writer_Agent: Second agent in the SequentialAgent pipeline.
 * Reads `macro_nodes` from session state, queries Brand Kit RAG,
 * and produces per-slide content enriched with brand context.
 * Writes `enriched_content` array to session state.
 */

interface MacroNode {
  title: string
  purpose: string
  key_points: string[]
}

interface EnrichedSlide {
  title: string
  content: string
  brandContext: any
}

const WRITER_PROMPT = `You are a presentation content writer. Given a slide structure, write concise bullet points for this slide.

Slide structure:
Title: {{title}}
Purpose: {{purpose}}
Key points: {{key_points}}

Brand context:
{{brand_context}}

Write exactly 3-5 SHORT bullet points. Rules:
- Each bullet: maximum 12 words
- No paragraphs, no headers, no sub-bullets
- Direct and specific — no filler phrases
- Prefix each line with "• "

Example output format:
• React uses a virtual DOM to minimize expensive DOM updates.
• Component-based architecture enables reusable, isolated UI blocks.
• Unidirectional data flow makes state changes predictable.

Return ONLY the bullet points, nothing else.`

async function getBrandKit(workspaceId: string): Promise<any> {
  // Primary: active brand kit
  const activeBrandKit = await db
    .select()
    .from(brandKits)
    .where(and(eq(brandKits.workspaceId, workspaceId), eq(brandKits.isActive, true)))
    .limit(1)

  if (activeBrandKit.length > 0) {
    return JSON.parse(activeBrandKit[0].tokens)
  }

  // Fallback: most recent brand kit
  const recentBrandKit = await db
    .select()
    .from(brandKits)
    .where(eq(brandKits.workspaceId, workspaceId))
    .orderBy(desc(brandKits.createdAt))
    .limit(1)

  if (recentBrandKit.length > 0) {
    return JSON.parse(recentBrandKit[0].tokens)
  }

  // Fallback: workspace defaults
  const workspaceDefault = await db
    .select()
    .from(workspaceDefaults)
    .where(and(eq(workspaceDefaults.workspaceId, workspaceId), eq(workspaceDefaults.type, 'theme')))
    .limit(1)

  if (workspaceDefault.length > 0) {
    return JSON.parse(workspaceDefault[0].data)
  }

  // Fallback: global defaults
  const globalDefault = await db
    .select()
    .from(globalDefaults)
    .where(eq(globalDefaults.type, 'theme'))
    .limit(1)

  if (globalDefault.length > 0) {
    return JSON.parse(globalDefault[0].data)
  }

  // Hardcoded defaults
  return {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    fontHeading: 'Inter',
    fontBody: 'Inter',
  }
}

export async function runWriterAgent(
  macroNodes: MacroNode[],
  workspaceId: string
): Promise<EnrichedSlide[]> {
  const brandContext = await getBrandKit(workspaceId)
  const enrichedSlides: EnrichedSlide[] = []

  for (const node of macroNodes) {
    const prompt = WRITER_PROMPT
      .replace('{{title}}', node.title)
      .replace('{{purpose}}', node.purpose)
      .replace('{{key_points}}', node.key_points.join(', '))
      .replace('{{brand_context}}', JSON.stringify(brandContext, null, 2))

    const { text } = await ai.generate({
      model: resolveModel(),
      prompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 1024,
      },
    })

    enrichedSlides.push({
      title: node.title,
      content: text,
      brandContext,
    })
  }

  return enrichedSlides
}
