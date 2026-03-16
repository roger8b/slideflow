## 1. Container Height Mode — Toolbar

- [x] 1.1 Add `HUG | FILL | FIX` 3-way toggle to the Container toolbar row in `ContextualToolbar.tsx`, after the existing width-mode group
- [x] 1.2 Implement active-state highlighting: read `height` prop, map `'auto'`/undefined → HUG, `'100%'` → FILL, `'<N>px'` → FIX
- [x] 1.3 Wire click handlers: HUG → `height: 'auto'`, FILL → `height: '100%'`, FIX → `height: '100px'` (default when switching in)
- [x] 1.4 Show numeric px input inline when FIX is active; parse current `height` string to populate initial value
- [x] 1.5 Wire px input `onChange` to update `height` prop as `'<N>px'`

## 2. Icon Size and Stroke Width — Toolbar

- [x] 2.1 Add `SZ` labeled numeric input to the Icon toolbar row in `ContextualToolbar.tsx`, styled like the existing `RAD`/`BORD` inputs
- [x] 2.2 Populate `SZ` input from `size` prop and wire `onChange` to update `size`
- [x] 2.3 Add `STK` labeled numeric input next to `SZ`, populate from `strokeWidth` prop and wire `onChange` to update `strokeWidth`

## 3. SettingsPanel Cleanup — Container

- [x] 3.1 Remove the Layout & Spacing section (flexDirection, alignItems, justifyContent, padding, gap) from the Container branch in `SettingsPanel.tsx`
- [x] 3.2 Remove the Grid Settings section (display flex/grid toggle, grid columns stepper) from the Container branch
- [x] 3.3 Remove the Effects section (boxShadow, backdropBlur, backgroundImage, backgroundOpacity) from the Container branch
- [x] 3.4 Keep and conditionally show a Height Fixed px input in the sidebar only when `height` ends in `px`
- [x] 3.5 Verify Style Presets (Surface/Glass) buttons still work after cleanup
- [x] 3.6 Verify Save as Block button still works after cleanup
