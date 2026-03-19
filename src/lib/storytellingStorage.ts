/**
 * storytellingStorage.ts
 * 
 * localStorage persistence for storytellings (macro slide structures).
 * Key: slideflow-storytellings
 * Schema: { id, title, macroNodes, slideCount, createdAt }
 * 
 * Dispatches storytellingsUpdated custom DOM event on save/delete for cross-component reactivity.
 */

// MacroNode type matches server schema (server/src/schemas/macroNode.ts)
export interface MacroNode {
  title: string
  purpose: string
  key_points: string[]
}

export interface SavedStorytelling {
  id: string
  title: string
  macroNodes: MacroNode[]
  slideCount: number
  createdAt: string
}

const STORAGE_KEY = 'slideflow-storytellings'

/**
 * Save a storytelling to localStorage.
 * Generates UUID for id, derives title from first macro_node.
 * Dispatches storytellingsUpdated event.
 */
export function saveStorytelling(macroNodes: MacroNode[]): SavedStorytelling {
  if (!macroNodes || macroNodes.length === 0) {
    throw new Error('Cannot save storytelling: macroNodes array is empty')
  }

  const storytelling: SavedStorytelling = {
    id: crypto.randomUUID(),
    title: macroNodes[0].title,
    macroNodes,
    slideCount: macroNodes.length,
    createdAt: new Date().toISOString(),
  }

  const existing = listStorytelling()
  const updated = [...existing, storytelling]

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    
    // Dispatch custom event for cross-component reactivity
    window.dispatchEvent(new CustomEvent('storytellingsUpdated'))
    
    return storytelling
  } catch (error) {
    console.error('Failed to save storytelling:', error)
    throw new Error('Failed to save storytelling to localStorage')
  }
}

/**
 * List all saved storytellings from localStorage.
 * Returns empty array if none exist or on parse error.
 */
export function listStorytelling(): SavedStorytelling[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
  } catch (error) {
    console.error('Failed to parse storytellings from localStorage:', error)
    return []
  }
}

/**
 * Delete a storytelling by id.
 * Dispatches storytellingsUpdated event.
 */
export function deleteStorytelling(id: string): void {
  const existing = listStorytelling()
  const filtered = existing.filter((s) => s.id !== id)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    
    // Dispatch custom event for cross-component reactivity
    window.dispatchEvent(new CustomEvent('storytellingsUpdated'))
  } catch (error) {
    console.error('Failed to delete storytelling:', error)
    throw new Error('Failed to delete storytelling from localStorage')
  }
}

/**
 * Get a single storytelling by id.
 * Returns undefined if not found.
 */
export function getStorytelling(id: string): SavedStorytelling | undefined {
  const all = listStorytelling()
  return all.find((s) => s.id === id)
}
