## 1. Border Color Control

- [x] 1.1 Extend `EditorContainer` `onOpenColorPicker` callback to accept a `propName` parameter (default `'background'`) so it can target any color prop
- [x] 1.2 Update `ColorSidebar` and its usage in `EditorContainer` to use the dynamic `propName` (affects both the prop read for current value and the `set-editor-prop` dispatch)
- [x] 1.3 Add `borderColor` swatch button to `ContextualToolbar` Container row, visually grouped with the `borderWidth` input, calls `onOpenColorPicker('borderColor')`

## 2. Box Shadow Cycle Button

- [x] 2.1 Define the three shadow preset constants in `ContextualToolbar` (None, Soft, Strong)
- [x] 2.2 Add a shadow cycle button to the Container toolbar row; clicking it advances `boxShadow` through the three presets via `set-editor-prop`
- [x] 2.3 Make the button icon reflect the current state (e.g., outline icon for none, filled for soft/strong)

## 3. Display Mode Toggle (Flex / Grid)

- [x] 3.1 Add Flex/Grid icon toggle buttons to the Container toolbar row (reuse the existing Rows/Cols toggle pattern)
- [x] 3.2 On click, dispatch `set-editor-prop` for `display`; when switching to `'grid'`, also dispatch `gridTemplateColumns` defaulting to `'repeat(2, 1fr)'` if current value is empty/undefined

## 4. Grid Column Count Stepper

- [x] 4.1 Add a helper to extract column count from `gridTemplateColumns` string (handles both `repeat(N, ...)` and space-separated values)
- [x] 4.2 Render `−/N/+` stepper in the Container toolbar row, visible only when `display === 'grid'`
- [x] 4.3 Stepper `+` dispatches `set-editor-prop` for `gridTemplateColumns` with `repeat(N+1, 1fr)` (max 6); `−` dispatches `repeat(N-1, 1fr)` (min 1)

## 5. Effects Popover (⋯ / FX)

- [x] 5.1 Add `isFxOpen` state to `ContextualToolbar` and a ⋯ button in the Container toolbar row
- [x] 5.2 Build the popover panel with three controls: `backdropBlur` range slider (0–40), `backgroundImage` text input, `backgroundOpacity` range slider (0–100)
- [x] 5.3 Wire each control to dispatch `set-editor-prop` for its respective prop on change
- [x] 5.4 Implement click-outside handler to close the popover (reuse existing pattern from other popovers in toolbar)
- [x] 5.5 Position the popover correctly (absolute, below the ⋯ button, with a z-index above the toolbar)

## 6. Cleanup & Verification

- [x] 6.1 Run `npm run lint` — fix any TypeScript errors
- [ ] 6.2 Manually verify all 5 new controls work end-to-end in the editor with a Container element selected
- [ ] 6.3 Verify that existing controls (background, borderRadius, borderWidth, padding, gap, flexDirection, alignItems, justifyContent) are unaffected
