## 1. Remove Duplicate Sections from SettingsPanel

- [x] 1.1 Remove the Text/Title `widthMode` toggle section from `SettingsPanel.tsx` (already in toolbar)
- [x] 1.2 Remove the Image `Image Source` section from `SettingsPanel.tsx` (already in toolbar)
- [x] 1.3 Remove the Icon `Icon Settings` section (name, size, strokeWidth) from `SettingsPanel.tsx` (already in toolbar)
- [x] 1.4 Remove the Container `Stroke & Corners` section (RAD, BORD) from `SettingsPanel.tsx` (to be in overflow panel)
- [x] 1.5 Remove the Container `Presets` section (Surface, Glass) from `SettingsPanel.tsx` (to be in overflow panel)
- [x] 1.6 Remove the `BookmarkPlus` Save as Block button from the `SettingsPanel` header actions and its name input UI (to be in overflow panel)

## 2. Refactor Container Toolbar — Move Controls to Overflow Panel

- [x] 2.1 Remove the existing FX popover button (`MoreHorizontal`) and its state (`isFxOpen`, `fxRef`) from `ContextualToolbar.tsx`
- [x] 2.2 Remove `RAD` and `BORD` inputs from the primary toolbar strip (they move to the overflow panel)
- [x] 2.3 Remove `borderColor` swatch button from the primary toolbar strip (moves to overflow panel)
- [x] 2.4 Remove `SHD` shadow cycle button from the primary toolbar strip (moves to overflow panel)
- [x] 2.5 Remove `Flex/Grid` display toggle and grid column stepper from the primary toolbar strip (moves to overflow panel)

## 3. Implement ⚙️ Settings Overflow Panel

- [x] 3.1 Add `isSettingsOpen` state and `settingsRef` ref to `ContextualToolbar.tsx`; add outside-click handler to close the panel
- [x] 3.2 Add `Settings` icon button (`⚙️`) to the Container toolbar strip (before the divider and action buttons); highlight when panel is open
- [x] 3.3 Implement the floating overflow panel div anchored to the `⚙️` button with groups: Border (RAD + BORD + border color swatch), Shadow (SHD cycle), Display (Flex/Grid + grid columns stepper)
- [x] 3.4 Add Effects group to the overflow panel: `backdropBlur` slider, `backgroundImage` URL input, `backgroundOpacity` slider
- [x] 3.5 Add Presets group to the overflow panel: Surface and Glass quick-apply buttons
- [x] 3.6 Add Save as Block section to the overflow panel: "Save as Block" button that shows inline name input + Save action; wire to `saveBlock` utility

## 4. Implement Inline Text Editing

- [x] 4.1 In the `Text` selector component (`src/components/editor/selectors/Text.tsx`), add `isEditing` local state; on `onDoubleClick` enter editing mode with `contentEditable`; on blur save text via prop update; on Escape restore original and exit
- [x] 4.2 In the `Title` selector component (`src/components/editor/selectors/Title.tsx`), apply the same inline editing pattern as Text
- [x] 4.3 Remove the `Text Content` textarea section from `SettingsPanel.tsx` (inline editing replaces it)

## 5. Remove SettingsPanel from Editor Layout

- [x] 5.1 Verify `SettingsPanel.tsx` has no remaining unique controls (only `Height Fixed` px input remains as the sole residual — keep it or migrate it)
- [x] 5.2 Remove `<SettingsPanel>` usage from `EditorContainer.tsx` and delete the import
- [x] 5.3 Delete `src/components/editor/SettingsPanel.tsx`
