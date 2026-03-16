## Why

The `SettingsPanel` right sidebar still contains several controls that are duplicated in (or should live in) the `ContextualToolbar`. The goal is to fully discontinue the sidebar by removing those duplicates, introducing a `⚙️` overflow floating panel on the Container toolbar for secondary controls, and enabling inline text editing so the sidebar textarea is no longer needed.

## What Changes

- **Remove** duplicate controls from `SettingsPanel`: Text/Title `widthMode` toggle, Image `Source` input, Icon `name/size/strokeWidth` inputs, Container `Stroke & Corners` section
- **Add** a `⚙️` settings overflow floating panel to the Container toolbar, housing all secondary controls: border-radius, border-width, border color, box shadow, flex/grid toggle, grid columns, FX effects (blur, background image, opacity), style presets (Surface / Glass), and Save as Block
- **Remove** the `⚙️` FX-only popover that currently exists and merge its contents into the new unified overflow panel
- **Add** inline text editing: double-click on a `Text` or `Title` element on the canvas to edit its content directly; remove the `Text Content` textarea from `SettingsPanel`
- **Remove** `SettingsPanel` entirely from the editor layout once all unique content has been migrated

## Capabilities

### New Capabilities
- `container-overflow-panel`: Unified `⚙️` floating overflow panel on the Container toolbar containing all secondary and advanced controls (border, shadow, layout mode, effects, presets, save-as-block)
- `inline-text-editing`: Double-click on Text/Title elements to edit content directly on the canvas without needing a sidebar textarea

### Modified Capabilities
- `container-toolbar-secondary-controls`: The FX popover is replaced by the unified overflow panel; all secondary controls are now in one place

## Impact

- `src/components/editor/ContextualToolbar.tsx` — add overflow panel, remove old FX popover, refactor Container section
- `src/components/editor/SettingsPanel.tsx` — remove duplicate sections; eventually remove the file/component entirely
- `src/components/editor/selectors/Text.tsx`, `Title.tsx` — add double-click inline edit support
- `src/components/editor/EditorContainer.tsx` — remove `SettingsPanel` from layout once deprecated
