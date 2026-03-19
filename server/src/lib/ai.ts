import { genkit } from 'genkit'
import { googleAI } from '@genkit-ai/googleai'
import { ollama } from 'genkitx-ollama'

/**
 * Single shared Genkit instance consumed by all three LlmAgents.
 * Provider selection is determined at startup by checking OLLAMA_BASE_URL.
 *
 * Provider rules:
 * - OLLAMA_BASE_URL set + GEMINI_API_KEY absent → valid (Ollama mode, used for local dev/testing)
 * - OLLAMA_BASE_URL absent + GEMINI_API_KEY set → valid (Gemini mode, used for production)
 * - Both absent → pipeline emits SSE error event immediately; no LLM call issued
 * - Both set → OLLAMA_BASE_URL takes precedence (Ollama mode)
 *
 * Model name convention (GEMINI_MODEL env var):
 * - Gemini: googleai/gemini-2.0-flash-exp  (must include plugin prefix)
 * - Ollama: qwen3.5:9b  (bare model name — ollama/ prefix added automatically)
 */
const isOllamaMode = Boolean(process.env.OLLAMA_BASE_URL)

export const ai = isOllamaMode
  ? genkit({ plugins: [ollama({ serverAddress: process.env.OLLAMA_BASE_URL! })] })
  : genkit({ plugins: [googleAI()] })

/**
 * Resolve the active model name for ai.generate().
 * In Ollama mode, bare model names (e.g. "qwen3.5:9b") are prefixed with "ollama/".
 * In Gemini mode, the full model string (e.g. "googleai/gemini-2.0-flash-exp") is used as-is.
 */
export function resolveModel(): string {
  const raw = process.env.GEMINI_MODEL || (isOllamaMode ? 'qwen3.5:9b' : 'googleai/gemini-2.0-flash-exp')
  if (isOllamaMode && !raw.startsWith('ollama/')) {
    return `ollama/${raw}`
  }
  return raw
}
