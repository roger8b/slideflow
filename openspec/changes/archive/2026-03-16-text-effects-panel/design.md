## Context

Slideflow's text editing is handled by Craft.js nodes (`Title`, `Text`) inside `EditorContainer`. Each node stores its visual properties as serialized JSON props. The contextual toolbar already opens secondary left panels (`ColorSidebar`, `FontSidebar`) via callbacks — this is the established pattern we follow.

The new `TextEffectsSidebar` must integrate without disrupting the existing panel-open-one-at-a-time behaviour: opening Effects closes Color and Font, and vice versa.

## Goals / Non-Goals

**Goals:**
- Add a `textEffect` prop (typed object) to `Title` and `Text` selectors
- Derive CSS at render time from the prop (no runtime style injection outside the component)
- Build `TextEffectsSidebar` with the established motion/animate slide-in pattern
- Inline color popover inside the effects panel (reuses `standardColors` + brand data)
- Effects button in `ContextualToolbar` visible only for `Title` / `Text` node types
- Implement exactly 5 effects: Nenhum, Sombreado, Flutuante, Vazado, Fundo

**Non-Goals:**
- Desalinhado, Contorno, Eco, Falha, Neon effects
- "Forma / Curvar" curved text (requires SVG textPath)
- Persisting effects to brand kit or saved blocks

## Decisions

### 1. `textEffect` as a single optional prop object (not many flat props)
Grouping all effect config under one `textEffect?: TextEffect` key keeps the Craft.js serialized JSON clean and makes it easy to zero out all effect state by setting `type: 'none'`. Flat props (e.g., `shadowBlur`, `shadowColor`) would pollute the prop namespace and make "clear effect" messy.

**Alternative considered:** Separate flat props per effect param. Rejected — too many props on each selector, no clean "reset" path.

### 2. CSS applied inside the selector component, not via external style injection
Each selector computes `textShadow`, `WebkitTextStroke`, etc. from `textEffect` at render time. This keeps the effect co-located with the node that owns it and plays well with Craft.js's serialization/deserialization cycle.

**Alternative considered:** A utility that walks the DOM and patches styles. Rejected — fragile, breaks in read-only preview mode.

### 3. `Fundo` (background) effect applied to the wrapper div, not inline on the text element
The background effect needs `padding` and `border-radius` on the container element, not on the text span. The selector's outer `<div>` is the right target, since it already handles `background` and `widthMode`.

### 4. Inline color popover, not full `ColorSidebar`
The full `ColorSidebar` is a full-height overlay that displaces other panels. For effect color picking, a small popover within the panel is sufficient and matches the reference design. It reuses `standardColors` from `constants/colors` and brand tokens from metadata.

### 5. Effect thumbnails are pure CSS-rendered preview divs (not images)
Static SVG/PNG thumbnails would require assets and wouldn't adapt to theme changes. Pure CSS with a small "Ag" preview text is consistent with how the app renders text and easy to maintain.

## Risks / Trade-offs

- **`-webkit-text-fill-color: transparent` for Vazado** may not render correctly in all export/print contexts → Mitigation: acceptable for presentation use case; document as known limitation.
- **`text-shadow` scaling** — shadow params use raw pixel values divided by a scale factor (e.g., `distance/5`). At very small font sizes the effect may look disproportionate → Mitigation: accept for V1, consider font-size-relative units in a future iteration.
- **`textEffect` prop is additive** — existing serialized layouts without this prop will default to `undefined`, which the selectors must treat as `type: 'none'` → Handle via default destructuring in selector component signature.

## Migration Plan

No migration needed. `textEffect` defaults to `undefined` (treated as no effect) in all existing serialized layouts. No breaking changes to the Craft.js resolver map.
