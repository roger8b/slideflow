## 1. Data Model — TextEffect type

- [x] 1.1 Create `src/types/textEffect.ts` exporting the `TextEffect` interface with all fields (type, shadow params, float params, hollow params, background params)
- [x] 1.2 Add `textEffect?: TextEffect` prop to `TextProps` in `src/components/editor/selectors/Text.tsx`
- [x] 1.3 Add `textEffect?: TextEffect` prop to `TitleProps` in `src/components/editor/selectors/Title.tsx`

## 2. CSS Application in Selectors

- [x] 2.1 Create `src/lib/applyTextEffect.ts` utility function that converts a `TextEffect` object into a `React.CSSProperties` object for the text element and a separate object for the wrapper element (for Fundo)
- [x] 2.2 Apply `applyTextEffect` in `Text.tsx` — spread text-element styles onto the markdown/text span, spread wrapper styles onto the outer div
- [x] 2.3 Apply `applyTextEffect` in `Title.tsx` — same pattern as Text

## 3. TextEffectsSidebar Component

- [x] 3.1 Create `src/components/editor/TextEffectsSidebar.tsx` with the panel shell: `isOpen`/`onClose` props, slide-in animation (`motion.div`, same pattern as FontSidebar), header with title "Efeitos" and X button
- [x] 3.2 Implement `EffectThumbnail` sub-component: renders a small "Ag" preview with inline CSS for the effect, plus label, with active purple border
- [x] 3.3 Implement the 5-thumbnail grid: Nenhum, Sombreado, Flutuante, Vazado, Fundo
- [x] 3.4 Implement contextual controls for Sombreado: Distância slider (0–100), Direção slider (-180–180), Desfoque slider (0–100), Transparência slider (0–100), Cor swatch
- [x] 3.5 Implement contextual controls for Flutuante: Intensidade slider (0–100)
- [x] 3.6 Implement contextual controls for Vazado: Espessura slider (0–100)
- [x] 3.7 Implement contextual controls for Fundo: Arredondamento slider (0–100), Extensão slider (0–100), Transparência slider (0–100), Cor swatch
- [x] 3.8 Implement `ColorPickerPopover` sub-component inside the sidebar: shows document colors, brand colors (`standardColors`), opens on swatch click, closes on color select or outside click
- [x] 3.9 Wire all slider changes and color selections to call the `onChange` callback prop with the updated `TextEffect` object
- [x] 3.10 Implement outside-click-to-close (same pattern as FontSidebar using `mousedown` listener)

## 4. ContextualToolbar — Efeitos button

- [x] 4.1 Add `onOpenEffectsPicker?: (nodeId: string, currentEffect: TextEffect | undefined) => void` to `ContextualToolbar` props interface
- [x] 4.2 Detect selected node type inside `ContextualToolbar` (check `data.displayName === 'Title'` or `'Text'`)
- [x] 4.3 Render the Efeitos button (Sparkles icon) in the toolbar only when a Title or Text node is selected, positioned after the position/layout controls
- [x] 4.4 On click, call `onOpenEffectsPicker` with the selected node ID and its current `textEffect` prop value

## 5. EditorContainer — State & Integration

- [x] 5.1 Add `isEffectsSidebarOpen` state and `activeEffectProp` state (`{ nodeId: string; currentEffect: TextEffect | undefined } | null`) to `EditorContainer`
- [x] 5.2 Pass `onOpenEffectsPicker` callback to `ContextualToolbar` — sets `activeEffectProp`, opens effects sidebar, closes color and font sidebars
- [x] 5.3 Render `TextEffectsSidebar` inside the `flex-1 flex overflow-hidden relative` div, passing `isOpen`, `onClose`, current effect value, brand colors, and document colors
- [x] 5.4 In the `TextEffectsSidebar` `onChange`, dispatch `set-editor-prop` custom event with `{ nodeId, key: 'textEffect', value: updatedEffect }` and update `activeEffectProp` state
