## Why

Text components (Title, Text) have no visual effect options beyond color and font. Adding a text effects panel — accessible from the contextual toolbar — lets users apply CSS-based effects like shadow, float, hollow stroke, and background highlight, closing a key gap compared to Canva-style editors.

## What Changes

- Add a new `TextEffectsSidebar` left panel component that slides in with a grid of effect thumbnails and contextual controls
- Add an `Efeitos` button to the contextual toolbar (visible only when a Title or Text node is selected, positioned after layout/position controls)
- Add a `textEffect` prop to both `Title` and `Text` selectors, with CSS applied at render time
- Implement 5 effects: Nenhum, Sombreado, Flutuante, Vazado, Fundo
- Each effect with controls exposes an inline color popover (document colors + brand colors + standard solids) rather than opening the full ColorSidebar

## Capabilities

### New Capabilities
- `text-effects-panel`: Left-side panel for selecting and configuring CSS text effects on Title and Text nodes. Effects: none, shadow (with distance/direction/blur/opacity/color), float (intensity), hollow (stroke thickness), background (roundness/extension/opacity/color).

### Modified Capabilities
- (none)

## Impact

- `src/components/editor/selectors/Text.tsx` — new `textEffect` prop, CSS application logic
- `src/components/editor/selectors/Title.tsx` — same
- `src/components/editor/ContextualToolbar.tsx` — new `onOpenEffectsPicker` callback + Efeitos button
- `src/components/editor/EditorContainer.tsx` — new sidebar state + integration
- New file: `src/components/editor/TextEffectsSidebar.tsx`
