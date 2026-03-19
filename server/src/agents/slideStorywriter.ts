import { ai, resolveModel } from '../lib/ai.js'

/**
 * SlideStorywriter_Agent: LlmAgent specialized in single-slide content structuring.
 * Runs BEFORE Designer_Agent in single-slide generation mode.
 * 
 * Responsibilities:
 * 1. Classify slide type: cover | agenda | content | section | closing | blank
 * 2. Extract concise headline (max 8 words)
 * 3. Produce structured body content based on type:
 *    - cover/section/closing → subtitle (1 sentence)
 *    - agenda/content → 3–5 bullet points (max 12 words each)
 *    - blank → no body (layout-only)
 * 4. Emit layoutHint: text-heavy | visual-focus | split | minimal
 * 
 * Output written to session.state['single_slide_content'].
 */

export interface SingleSlideContent {
  type: 'cover' | 'agenda' | 'content' | 'section' | 'closing' | 'blank'
  headline: string          // max 8 words
  body: string[]            // bullets (content/agenda) OR [subtitle] (cover/section) OR []
  layoutHint: 'text-heavy' | 'visual-focus' | 'split' | 'minimal'
}

const STORYWRITER_PROMPT = `You are a presentation content specialist. Your job is to structure a single slide's content based on the user's prompt.

User prompt:
{{prompt}}

{{context_section}}

Brand context (for reference):
{{brand_context}}

════════════════════════════════════════
YOUR TASK
════════════════════════════════════════
1. CLASSIFY the slide type based on the prompt:
   - cover: opening slide with title + subtitle
   - agenda: list of topics/sections
   - content: main informational slide with bullet points
   - section: transition slide marking a new section
   - closing: final slide with CTA or summary
   - blank: layout-only slide (no text content)

2. EXTRACT a concise headline (max 8 words)

3. PRODUCE structured body content AS AN ARRAY:
   - For cover/section/closing: return an array with ONE subtitle sentence (max 15 words)
     Example: ["Your subtitle goes here"]
   - For agenda/content: return an array with 3–5 bullet points (max 12 words each)
     Example: ["First point", "Second point", "Third point"]
   - For blank: return an empty array
     Example: []

4. EMIT a layoutHint:
   - text-heavy: lots of text, minimal visuals
   - visual-focus: image/icon-driven, minimal text
   - split: balanced text + visual split layout
   - minimal: very sparse, few elements

════════════════════════════════════════
OUTPUT FORMAT (JSON ONLY)
════════════════════════════════════════
You MUST return a valid JSON object with this EXACT structure. Do not include any markdown formatting, code blocks, or additional text.

CRITICAL: The "body" field MUST ALWAYS be an array of strings, even if it contains only one item.

Example for cover slide:
{
  "type": "cover",
  "headline": "Welcome to Our Presentation",
  "body": ["Discover innovative solutions for modern challenges"],
  "layoutHint": "minimal"
}

Example for content slide:
{
  "type": "content",
  "headline": "Key Benefits",
  "body": ["Increases productivity by 40%", "Reduces costs significantly", "Improves team collaboration"],
  "layoutHint": "text-heavy"
}

Example for blank slide:
{
  "type": "blank",
  "headline": "Section Break",
  "body": [],
  "layoutHint": "minimal"
}

Valid type values: "cover", "agenda", "content", "section", "closing", "blank"
Valid layoutHint values: "text-heavy", "visual-focus", "split", "minimal"

Return ONLY the JSON object. No explanations. No markdown. Just the JSON.`

export async function runSlideStorywriterAgent(
  prompt: string,
  context: string | undefined,
  brandContext: any
): Promise<SingleSlideContent> {
  const contextSection = context
    ? `\nAdditional context:\n${context}\n`
    : ''

  const finalPrompt = STORYWRITER_PROMPT
    .replace('{{prompt}}', prompt)
    .replace('{{context_section}}', contextSection)
    .replace('{{brand_context}}', JSON.stringify(brandContext, null, 2))

  const { text } = await ai.generate({
    model: resolveModel(),
    prompt: finalPrompt,
    config: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  })

  console.log('SlideStorywriter raw response:', text)

  // Try to extract JSON from various formats
  let jsonText = text.trim()
  
  // Remove markdown code blocks if present
  jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '')
  
  // Try to find JSON object
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error('SlideStorywriter raw response:', text)
    throw new Error('No JSON object found in SlideStorywriter response')
  }

  let result: any
  try {
    result = JSON.parse(jsonMatch[0])
  } catch (parseError) {
    console.error('SlideStorywriter JSON parse error:', parseError)
    console.error('Attempted to parse:', jsonMatch[0])
    throw new Error('Failed to parse SlideStorywriter JSON response')
  }

  console.log('SlideStorywriter parsed result:', JSON.stringify(result, null, 2))

  // Auto-fix: if body is a string, convert it to an array
  if (typeof result.body === 'string') {
    console.warn('SlideStorywriter returned body as string, converting to array')
    result.body = result.body.trim() ? [result.body] : []
  }

  // Validate required fields with detailed logging
  const validationType = typeof result.type === 'string' && result.type.length > 0
  const validationHeadline = typeof result.headline === 'string' && result.headline.length > 0
  const validationBody = Array.isArray(result.body)
  const validationLayoutHint = typeof result.layoutHint === 'string' && result.layoutHint.length > 0

  if (!validationType || !validationHeadline || !validationBody || !validationLayoutHint) {
    console.error('SlideStorywriter validation failed. Received:', JSON.stringify(result, null, 2))
    console.error('Validation details:', {
      type: { valid: validationType, value: result.type },
      headline: { valid: validationHeadline, value: result.headline },
      body: { valid: validationBody, value: result.body },
      layoutHint: { valid: validationLayoutHint, value: result.layoutHint },
    })
    throw new Error(`Invalid SlideStorywriter response: missing required fields. Got: ${JSON.stringify(result)}`)
  }

  return result as SingleSlideContent
}
