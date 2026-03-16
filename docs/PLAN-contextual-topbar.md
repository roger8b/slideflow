# PLAN: Contextual Top Bar (Canva-style)

## Objective

Implement a **Contextual Property Bar** (Canva-style) that resides directly **below the main header**. This bar will automatically update based on the selected component, exposing all essential styling options (font, color, borders, etc.) to minimize mouse travel and eliminate side-panel dependency for 80% of common tasks.

## Problem Statement

The current editor forces users to switch between the canvas and a dense side panel for basic changes like font size or color. This "ping-pong" interaction adds friction. A contextual bar follows the user's focus and provides immediate access to relevant tools.

## Success Criteria

- **Positioning:** Fixed bar located between the `Header` and the `Main Content Area`.
- **Reactivity:** Real-time update of controls based on selection (`Title`, `Text`, `Container`, `Icon`, `Image`).
- **Scope:** Complete set of "Basics" (Colors, Fonts, Sizes, Borders, Alignments) per component.
- **Visibility:** Only visible when a component is selected; hidden or "Empty State" otherwise.

## Visual References (Canva Inspiration)

The implementation should mirror the logic and density of these Canva examples:

1. **Text Controls:** Font | Size (+/-) | Color | B | I | U | Alignment | List | Spacing
2. **Image/Shape Controls:** Edit | Color/Background | Border Style | Corner Rounding | Crop | Flip | Position
3. **Container/Icon:** Real-time Property Manipulation.

## Implementation Strategy

### Phase 1: Layout Restructuring (App.tsx)

- Add a new `div` for the `ContextualToolbar` between `<header>` and `<main>`.
- Ensure it has high `z-index` and a "Glassmorphism" effect for premium feel.
- Implement an transition for appearance/disappearance.

### Phase 2: Property Mapping & Control Library

- Create a specialized set of "Mini-Controls" for:
  - `ColorPicker` (compact)
  - `FontSizeCounter` (+ and - buttons)
  - `AlignmentToggle`
  - `BorderStyleSelector` (solid, dashed, dotted)
- Use `useEditor` from Craft.js to get selected node type and props.

### Phase 3: Component-Specific UI Sets

#### A. Text & Title (Image 1 Logic)
- **Font Family:** Dropdown utilizing Brand fonts.
- **Font Size:** Centered number with `-` and `+` buttons.
- **Color:** Brand palette quick-access.
- **Styles:** Bold, Italic, Underline, Case transformation.
- **Alignment:** Left, Center, Right, Justified.

#### B. Container & Shape (Image 3 Logic)
- **Fill Color:** Background property control.
- **Border:** Thickness slider and color picker.
- **Corner Radius:** Slider for rounding.
- **Layout:** Quick access to `Padding` and `Gap` (if flex).

#### C. Icon & Image (Image 2 Logic)
- **Icon Selector:** Modal trigger or small inline switcher.
- **Image Filters/Effects:** Quick controls for Opacity/Shadow.
- **Size:** Uniform scaling controls.

### Phase 4: Positioning & Utility
- **Position Action:** Send to front, send to back, align to slide.
- **Paint Format:** Option to copy styles from one element to another.
- **Multi-select:** Group, Ungroup, and Common properties.

## Task Breakdown

### Workstream A: The Toolbar Component
1. Create `ContextualToolbar.tsx` scaffold.
2. Implement selection logic using Craft.js hooks.
3. Build specialized "Control Sets" for each selector type.

### Workstream B: Layout Integration
1. Modify `App.tsx` to toggle between `StandardHeader` and `ContextualToolbar`.
2. Handle "multi-selection" state (show common actions like Delete or Grouping).

### Workstream C: Property Sync
1. Ensure `setProp` from Craft.js is called correctly for all inputs.
2. Implement "Quick Pickers" for colors and font sizes that don't overlap the design area.

## Verification Checklist

- [ ] Selecting a Title shows font controls in the top bar.
- [ ] Changing font size in the top bar updates the Title instantly.
- [ ] Selecting a Container shows background/padding controls.
- [ ] Selecting an Icon shows icon swap/color controls.
- [ ] Deselecting hides the bar and shows the standard logo/save header.
- [ ] The UI feels fast and "zero friction".
