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
 * Model name convention:
 * - Gemini: GEMINI_MODEL=googleai/gemini-2.0-flash-exp
 * - Ollama: GEMINI_MODEL=qwen2.5-coder:7b (any model pulled via `ollama pull`)
 * 
 * The GEMINI_MODEL env var is reused for both providers — its value is passed directly to
 * ai.generate({ model: ... }). Genkit resolves the model string through the active plugin.
 */
export const ai = process.env.OLLAMA_BASE_URL
  ? genkit({ plugins: [ollama({ serverAddress: process.env.OLLAMA_BASE_URL })] })
  : genkit({ plugins: [googleAI()] })
