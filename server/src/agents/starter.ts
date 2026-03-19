import { ai, resolveModel } from '../lib/ai.js'

/**
 * Starter_Agent: First agent in the SequentialAgent pipeline.
 * Generates the macro slide graph structure from the user prompt.
 * Writes `macro_nodes` array to session.state.
 */

const STARTER_PROMPT = `You are a presentation structure expert. Given a user's topic or prompt, generate a logical slide structure.

Output a JSON array of slide objects with this structure:
[
  {
    "title": "Slide title",
    "purpose": "What this slide accomplishes",
    "key_points": ["Point 1", "Point 2", "Point 3"]
  }
]

Rules:
- Generate ONLY the slides that are necessary for the content provided
- Do NOT invent information that wasn't mentioned in the prompt
- If the prompt is brief, generate fewer slides (minimum 3)
- If the prompt is detailed, generate more slides (maximum 12)
- First slide should typically be a title/intro slide
- Last slide should typically be a conclusion or call-to-action
- Each slide should have a clear, focused purpose
- Keep titles concise (max 8 words)
- Provide 2-4 key points per slide based on the content available

IMPORTANT: Only create slides for information explicitly provided or clearly implied in the prompt. Do not add generic filler slides.

User prompt: {{prompt}}

Return ONLY the JSON array, no additional text.`

export async function runStarterAgent(prompt: string): Promise<any[]> {
  const { text } = await ai.generate({
    model: resolveModel(),
    prompt: STARTER_PROMPT.replace('{{prompt}}', prompt),
    config: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  })
  
  // Add delay to avoid Ollama concurrent request limit
  if (process.env.OLLAMA_BASE_URL) {
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  // Parse JSON response
  try {
    // Log the raw response for debugging
    console.log('Starter_Agent raw response:', text.substring(0, 500))
    
    // Try to extract JSON array - handle markdown code blocks
    let jsonText = text.trim()
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '')
    
    // Find JSON array
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error('No JSON array found in response. Full text:', text)
      throw new Error('No JSON array found in response')
    }
    
    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Failed to parse Starter_Agent response:', error)
    console.error('Full response text:', text)
    throw new Error('Invalid JSON response from Starter_Agent')
  }
}
