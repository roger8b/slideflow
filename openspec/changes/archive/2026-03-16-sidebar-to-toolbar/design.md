## Context

The `ContextualToolbar` is the primary editing surface for common prop changes. The `SettingsPanel` (right sidebar) currently duplicates many of those controls and also holds a handful of controls that haven't been added to the toolbar yet (Container height mode, Icon size/stroke). The goal is to complete the toolbar and slim the sidebar to advanced/rare controls only.

Current relevant files:
- `src/components/editor/ContextualToolbar.tsx` — ~766 lines, per-type toolbar rows
- `src/components/editor/SettingsPanel.tsx` — ~400 lines, full property editor per type

## Goals / Non-Goals

**Goals:**
- Add Height Mode (Hug / Fill / Fixed + px) to Container toolbar row
- Add Icon Size and Stroke Width inputs to Icon toolbar row
- Remove duplicated layout/flex/grid/shadow/blur sections from SettingsPanel
- Keep SettingsPanel for: Height Fixed px input (shown only when Fixed selected), Style Presets, Save as Block

**Non-Goals:**
- Inline text editing (double-click-to-edit) — deferred to a separate change
- Style Presets migration to toolbar — deferred (low priority, T5 from plan)
- Any change to the data model or persistence format

## Decisions

### Height Mode control placement
Add a compact 3-way toggle (`HUG | FILL | FIX`) to the Container toolbar row, immediately after the existing width-mode group. When `FIX` is active, show a small numeric px input inline.

Prop mapping:
- **Hug** → `height: 'auto'`
- **Fill** → `height: '100%'`
- **Fixed** → `height: '<N>px'` (parse current value for the numeric input default)

**Rationale**: Mirrors the existing Width Mode toggle pattern already in the Text toolbar (`StretchHorizontal` / `Minimize2`), keeping the interaction model consistent.

### Icon Size and Stroke Width
Add two compact labeled inputs (`SZ` and `STK`) to the Icon toolbar row, styled the same as the existing `RAD` and `BORD` inputs. Operate directly on the `size` (number) and `strokeWidth` (number) Craft.js props.

**Rationale**: Keeps all icon controls in one row. No new UI patterns needed.

### SettingsPanel pruning
Remove entire JSX sections for Layout & Spacing (flexDirection, alignItems, justifyContent, padding, gap), Grid Settings (display flex/grid, columns), and Effects (shadow, blur, backgroundImage, opacity) from the Container branch of SettingsPanel. These are now authoritative in the toolbar.

Keep:
- Height section reduced to the Fixed px input (only when height is a fixed px value)
- Style Presets (Surface/Glass quick-apply buttons)
- Save as Block button

**Alternative considered**: Hide sidebar sections with CSS instead of removing them. Rejected — keeps dead code, confuses future contributors.

## Risks / Trade-offs

- **Stale sidebar state** → SettingsPanel reads live Craft.js props so removal of sections can't cause stale reads; no risk.
- **Toolbar overflow on small viewports** → Height Mode adds ~90px. The toolbar already scrolls horizontally (overflow-x: auto). Acceptable; no additional work needed.
- **Height value edge cases** (e.g., `height: undefined`) → Default Hug when value is absent or `'auto'`. Parse numeric from `'Npx'` string; fall back to `100` if unparseable.

## Migration Plan

1. Implement toolbar additions (Height Mode, Icon Size/Stroke) — no behavior regression
2. Remove sidebar sections — users on the sidebar will find those controls gone; toolbar is the replacement
3. No data migration needed — Craft.js JSON props are unchanged

Rollback: revert the two files. No database or storage changes.

## Open Questions

- None. All decisions align with the existing pattern set in the codebase.
