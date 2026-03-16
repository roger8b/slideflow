## Context

The `ContextualToolbar` has grown to ~20 visible controls for Container, making it too wide and visually overwhelming. The `SettingsPanel` right sidebar still contains several sections that are either duplicated in the toolbar (widthMode, Icon settings, Image src, Stroke & Corners) or need to be migrated (Text Content). The current FX popover covers effects only; it needs to expand into a unified secondary-controls panel.

**Current Container toolbar density (problem):**
```
[Container] | [Fill] | [RAD][BORD][PAD][borderColor] | [SHD] | [↓⇆][GAP] | [Flex|Grid] | [-N+] | [←→↑↓ main] [←→↑↓ cross] | [HUG|FILL|FIX] | [FX...] | [⧉][⧇][🗑]
```

**Goal state (clean primary strip):**
```
[Container] | [Fill] | [PAD][GAP] | [↓⇆ dir] | [←→↑↓ main][←→↑↓ cross] | [HUG|FILL|FIX] | [⚙️] | [⧉][⧇][🗑]
```
Secondary panel (⚙️ click):
```
RAD · BORD · ⬜ borderColor · [SHD cycle]
[Flex|Grid] · [-N+] columns
Blur slider · Bg Image URL · Opacity slider
[Surface preset] [Glass preset]
[💾 Save as Block]
```

## Goals / Non-Goals

**Goals:**
- Move RAD, BORD, border color, SHD, Flex/Grid, grid columns, FX effects, style presets, and Save as Block out of the primary toolbar strip into a `⚙️` floating overflow panel
- Remove duplicate sections from `SettingsPanel`: widthMode toggle, Image Source, Icon Settings (name/size/stroke), Container Stroke & Corners
- Implement inline text editing (double-click on canvas) for Text/Title elements
- Remove `SettingsPanel` from `EditorContainer` layout once all remaining unique content is migrated
- Convert "Save as Block" from header button in sidebar to an item in the ⚙️ overflow panel

**Non-Goals:**
- Changing the Text/Title toolbar (no changes requested)
- Adding new alignment or typography controls
- Persisting ⚙️ panel open/closed state across selections
- Redesigning the Image toolbar

## Decisions

### Decision 1: Overflow panel positioning — floating below the ⚙️ button, not a sidebar

**Chosen:** A compact floating `<div>` that appears directly below (or above if near bottom of viewport) the `⚙️` button, with a `useRef` + `mousedown` outside-click handler to dismiss it. It lives inside the toolbar's `relative` ancestor.

**Why:** Keeps all controls visually connected to the selected element. A sidebar or modal would force the eye away from the canvas; a popover keeps context tight. The existing FX popover uses this same pattern — we're just expanding it.

**Alternative considered:** Full sidebar panel replacement — rejected because it brings back the same "sidebar that competes for space" problem.

### Decision 2: Overflow panel replaces the existing FX popover entirely

**Chosen:** Remove `isFxOpen` / `fxRef` state and the current `MoreHorizontal` FX button. Replace with `isSettingsOpen` / `settingsRef` state and a `Settings` (⚙️) icon button. The panel contains all secondary controls in logical groups.

**Why:** Single dismiss/open state is simpler. Two separate popovers (FX and Settings) would confuse users about where to look for what.

### Decision 3: Style presets as a dedicated section in the overflow panel, not individual toolbar buttons

**Chosen:** A "Presets" group inside the ⚙️ panel with Surface and Glass buttons side-by-side.

**Why:** The user explicitly requested "menu de presets" rather than individual toolbar buttons. Presets are used occasionally; they don't deserve primary toolbar real estate.

### Decision 4: Save as Block moves to ⚙️ panel

**Chosen:** The `BookmarkPlus` button currently in `SettingsPanel` header becomes a button inside the `⚙️` panel, opening an inline name input + save action within the panel.

**Why:** This removes the last "unique" reason to open the sidebar for Container. Once Save as Block is in the panel, the sidebar truly has nothing unique left.

### Decision 5: Inline text editing via `contentEditable` double-click

**Chosen:** Double-click on a `Text` or `Title` element enables `contentEditable` mode on the rendered element. On blur or Enter, the new text is written back via `setProp`. Click-outside exits editing mode.

**Why:** Eliminates the need for the `SettingsPanel` textarea entirely. Direct manipulation is more intuitive than a remote panel.

**Alternative considered:** A floating inline input field above the element — rejected as more complex with no UX benefit.

### Decision 6: SettingsPanel removal sequence

1. Remove sidebar duplicate sections (widthMode, Image Source, Icon Settings, Stroke & Corners)
2. Add ⚙️ panel with Save as Block so sidebar has zero unique content for Container
3. Implement inline text editing so sidebar has zero unique content for Text/Title
4. Remove `<SettingsPanel>` from `EditorContainer` layout
5. Delete the `SettingsPanel.tsx` file

This sequence ensures no functionality is lost before the sidebar is removed.

## Risks / Trade-offs

- **⚙️ panel too wide**: If the toolbar is near the right edge of the canvas, the panel should align to the right. Handle with `right-0` positioning on the floating div. → Mitigation: Use `right-0` on the panel anchored to the ⚙️ button wrapper.
- **Inline edit UX on click-selection conflict**: Craft.js uses single-click to select. Double-click must enter edit mode without Craft.js re-processing the event. → Mitigation: Use `onDoubleClick` with `e.stopPropagation()` and track edit state in local component state.
- **Save as Block state inside panel**: The block-name input must open inline within the panel without closing the panel. → Mitigation: Track `isSavingBlock` + `blockName` state alongside `isSettingsOpen`; clicking "Save as Block" item replaces panel content with the name input.

## Open Questions

- Should the ⚙️ panel animate open (fade/slide) or appear instantly? → Suggest simple fade, consistent with existing FX popover.
- When all selectors are migrated away from SettingsPanel, should the `SettingsPanel.tsx` file be fully deleted or kept as a stub? → Delete it; the `EditorContainer` import can be removed.
