# 📋 PLAN: Grid System & Icon Component

## Phase -1: Context Check
**Goal**: Implement CSS Grid support for the `Container` component and a new `Icon` component to enable precise, professional layouts (like the Wardiere template) without deep nesting. Update AI skills and refactor an existing template as a proof of concept.
**Current State**: 
- `Container` relies heavily on Flexbox, requiring complex nesting for grids.
- No native `Icon` component exists in the Craft.js canvas.
- `presentationTemplates.json` has a Wardiere template that currently uses complex flex nesting for its "Content" slide.

## Phase 0: Socratic Gate (Pre-approved from brainstorm)
1. **Icon Library**: We will use `lucide-react` since it's already a dependency in the project.
2. **Container Controls**: The `ContainerSettings` sidebar will need a toggle between 'flex' and 'grid', and an input for `gridTemplateColumns`.
3. **Skill Update**: The `slideflow-templates` skill must be updated to instruct AI on how to encode Grid containers and Icons in the stringified JSON.

## Phase 1: Planning and Architecture

### 1. New Component: `Icon.tsx`
- **Location**: `src/components/editor/selectors/Icon.tsx`.
- **Props**: `name` (string, mapping to Lucide icons), `color` (hex/CSS var), `size` (number).
- **Settings**: Dropdown for icon name, color picker, size slider.
- **Integration**: Add to `App.tsx` Craft.js resolvers.

### 2. Update `Container.tsx` (Grid System)
- **Props Addition**: 
  - `display`: `'flex' | 'grid'` (default 'flex')
  - `gridTemplateColumns`: `string` (e.g., `'1fr 1fr'`, `'repeat(3, 1fr)'`)
- **Render Logic**: Pass these props to the inline `style` object of the DOM element.
- **Settings UI**: Add a "Layout Type" segmented control (Flex / Grid). If Grid is selected, show an input field for Columns.

### 3. Update AI Skill (`.agent/skills/slideflow-templates/SKILL.md`)
- Add a section on **Grid Layouts**: Show how to set `"display": "grid"` and `"gridTemplateColumns"` in the `props`.
- Add a section on **Icons**: Show the node structure for `{"type": {"resolvedName": "Icon"}}` and its `props.name`.

### 4. Update Template Example (`src/data/presentationTemplates.json`)
- **Target**: Item index 1 (the 2nd template: `wardiere_kickoff_minimalist`), Slide index 1 ("Content").
- **Refactoring**: Replace the nested Flexbox rows (`grid_container` and inner rows) with a single `Container` using `display: "grid"` and `gridTemplateColumns: "1fr 1fr"`. Inject new `Icon` nodes instead of placeholder colored boxes for visual flair.

## Phase 2: Implementation Sequence
1. Create the `Icon` component and its Settings panel.
2. Register `Icon` in `App.tsx`.
3. Modify `Container.tsx` and `ContainerSettings` to support Grid parameters.
4. Update the `.agent/skills/slideflow-templates/SKILL.md` file with the new capabilities.
5. Create a script or edit `presentationTemplates.json` to swap the Wardiere "Content" slide layout for the new Grid + Icon structure.

## Phase 3: Verification
- Drop an Icon on the canvas and change it via the sidebar.
- Set a Container to Grid, apply '1fr 1fr', drop multiple items, and verify the grid structure.
- Load the "Wardiere Project Kickoff" template and verify Slide 2 renders perfectly using the new features without crashing.
