## Why

The Container component has a rich set of design properties (border color, box shadow, display mode, grid columns, background image, backdrop blur, overlay opacity), but most are only accessible via the right-side `SettingsPanel`. As more controls are migrated to the contextual toolbar, users have no quick access to these secondary properties — they must hunt through the panel. The goal is to bring the most actionable container properties into the toolbar while organizing overflow into a compact secondary control.

## What Changes

- Add `borderColor` as a color-picker button in the toolbar (paired visually with `borderWidth`)
- Add `boxShadow` as a quick-toggle preset button (None / Soft / Strong)
- Add `display` mode toggle (Flex / Grid) to the toolbar
- Add `gridTemplateColumns` column count control (1–6), visible only when display=grid
- Move `backdropBlur`, `backgroundImage`, and `backgroundOpacity` behind a "More" (⋯) popover so they're accessible without cluttering the primary toolbar row
- Remove or de-emphasize these same controls from `SettingsPanel` to avoid duplication (keep as secondary reference only)

## Capabilities

### New Capabilities

- `container-toolbar-secondary-controls`: Expose border color, box shadow presets, display mode (flex/grid), grid column count, and an overflow popover for effects (backdrop blur, background image, overlay opacity) directly in the contextual toolbar for Container elements.

### Modified Capabilities

*(none — no existing spec-level requirements change)*

## Impact

- `src/components/editor/ContextualToolbar.tsx` — primary edit surface
- `src/components/editor/SettingsPanel.tsx` — minor de-duplication (keep sections but mark as secondary)
- No new dependencies; uses existing Craft.js `setProp` / `set-editor-prop` event pattern
