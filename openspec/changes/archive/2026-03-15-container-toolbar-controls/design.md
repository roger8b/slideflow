## Context

The `ContextualToolbar` already exposes 8 container props: `background`, `borderRadius`, `borderWidth`, `padding`, `gap`, `flexDirection`, `justifyContent`, `alignItems`. The remaining container props live exclusively in `SettingsPanel` (right sidebar). The toolbar row has limited horizontal space, so not all missing props can simply be added inline.

Current toolbar row layout (Container):
```
[Fill ●] [RAD __] [BORD __] [PAD __] [GAP __]   [Rows|Cols]  [← ↓ →]  [↑ ↓ ↓]
```

Missing from toolbar: `borderColor`, `boxShadow`, `display`, `gridTemplateColumns`, `backdropBlur`, `backgroundImage`, `backgroundOpacity`, `width`.

## Goals / Non-Goals

**Goals:**
- Add `borderColor` picker (opens ColorSidebar targeting `borderColor`)
- Add `boxShadow` quick-cycle button (None → Soft → Strong → None)
- Add `display` toggle (Flex / Grid) as an icon pair
- Add `gridTemplateColumns` column-count stepper (1–6), shown only when display=grid
- Add "More" (⋯) popover for secondary effects: `backdropBlur` slider, `backgroundImage` URL input, `backgroundOpacity` slider

**Non-Goals:**
- Removing `SettingsPanel` sections — they stay as secondary reference
- Toolbar controls for `width`, `backgroundSize`, `backgroundPosition`, `backdropBlurColor` — too rare/complex for toolbar; SettingsPanel only

## Decisions

### D1: `borderColor` via ColorSidebar (not inline picker)
The app already has `ColorSidebar` for `background`. Re-use the same pattern: clicking `borderColor` button in toolbar dispatches `open-color-picker` for the `borderColor` prop. This avoids embedding a second color picker inline and keeps parity with `background`.

Alternative considered: inline `<input type="color">`. Rejected because it doesn't match the existing design language and lacks the brand token swatches.

### D2: `boxShadow` as a 3-state cycle button
Three common shadow values cover 95% of use cases: none, soft (`0 4px 12px rgba(0,0,0,0.12)`), strong (`0 10px 30px rgba(0,0,0,0.25)`). A cycle button (icon: `Shadow`) avoids adding a text input to an already dense toolbar row.

Alternative considered: popover with preset tiles. Rejected as over-engineered for 3 states.

### D3: `display` toggle as Flex/Grid icon pair
Same visual pattern as `flexDirection` (Rows/Cols). Two icon buttons side-by-side, active state highlighted. When switching to Grid, `gridTemplateColumns` defaults to `repeat(2, 1fr)`.

### D4: Grid column count as stepper (−/N/+), conditionally shown
A minimal `−` / `2` / `+` stepper for column count (1–6), rendered inline next to the Flex/Grid toggle only when `display=grid`. Collapses when display=flex to save space.

### D5: "More" popover (⋯) for effects
`backdropBlur`, `backgroundImage`, `backgroundOpacity` are less frequently edited. A compact popover triggered by a `⋯` or `FX` button holds these three controls. Uses a `useState` + click-outside pattern (same as existing popovers in the toolbar).

### D6: All prop changes via `set-editor-prop` event (existing pattern)
No new IPC mechanism needed. `borderColor` and `boxShadow` use the same `window.dispatchEvent(new CustomEvent('set-editor-prop', ...))` path already used by other toolbar controls.

## Risks / Trade-offs

- **Toolbar width pressure**: Adding more controls risks overflow on smaller screens. Mitigation: the grid column stepper is conditional (only visible in grid mode), and effects are behind the ⋯ popover, keeping the primary row compact.
- **Color sidebar prop targeting**: Opening ColorSidebar for `borderColor` requires `EditorContainer` to pass the active color prop name. This already works for `background` — we extend it to support any prop name.
- **SettingsPanel duplication**: Some props will exist in both places temporarily. This is acceptable — the SettingsPanel retains its current sections unchanged.

## Open Questions

*(none — implementation path is clear)*
