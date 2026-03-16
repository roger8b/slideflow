## Why

The ContextualToolbar now covers ~90% of daily-use controls, but four properties are still toolbar-only accessible via the sidebar: Container Height Mode, Icon Size, Icon Stroke Width, and (for complex edits) Text Content. The SettingsPanel also duplicates many controls now in the toolbar (padding, flex, grid, shadow, blur), creating maintenance overhead and UI confusion. Completing the migration and slimming the sidebar to "advanced only" makes the toolbar the single source of truth for common editing.

## What Changes

- Add **Height Mode** toggle (Hug / Fill / Fixed + px input) to the Container toolbar section
- Add **Icon Size** and **Icon Stroke Width** compact inputs to the Icon toolbar section
- Remove duplicated controls from `SettingsPanel`: Layout, Alignment, Gap, Padding, Grid, Flex, Shadow, Blur sections
- Keep in `SettingsPanel` (advanced/rare): Height Fixed value input, Style Presets (Surface/Glass), Save as Block

## Capabilities

### New Capabilities
- `container-height-mode`: Height Mode control (Hug / Fill / Fixed) in the Container toolbar row
- `icon-size-controls`: Icon Size and Stroke Width compact inputs in the Icon toolbar row

### Modified Capabilities
- `container-toolbar-secondary-controls`: SettingsPanel now shows only advanced/rare controls; duplicated layout controls removed

## Impact

- `src/components/editor/ContextualToolbar.tsx` — add Height Mode group to Container section; add Size/Stroke inputs to Icon section
- `src/components/editor/SettingsPanel.tsx` — remove duplicated Layout, Alignment, Padding, Gap, Grid, Flex, Shadow, Blur sections from Container; keep Height Fixed input, Presets, Save Block
- No API or persistence changes; all edits operate on existing Craft.js props (`height`, `size`, `strokeWidth`)
