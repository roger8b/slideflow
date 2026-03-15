# 📋 PLAN: Presentation Templates

## Phase -1: Context Check
**Goal**: Add a "Presentation Templates" feature (similar to Canva) where users can select a full presentation model, which creates multiple slides following a consistent layout pattern. The user provided a "Black and Red Minimalist Project Kickoff" PDF as a reference for the first template.

**Current State**: 
- We have single-slide templates (`src/data/slideTemplates.json`).
- We have brand kits (`src/data/brandKits.json`).
- Presentations consist of a `nodes` array and `edges` array in React Flow.

## Phase 0: Socratic Gate (Pending User Confirmation)
Before we write any code, we need to clarify a few details:

1. **Template Application Behavior**: When the user selects a full presentation template, should this *override* their current presentation (warning them if they have unsaved changes), or should this only be available when creating a "New Presentation"?
2. **PDF Content**: Since the PDF is a binary file (and we can't easily parse its visual layout automatically into Craft.js JSON), our plan is to manually create a JSON structure matching the aesthetic (Black, Red, Minimalist) with placeholder text (Title Slide, Agenda, About Us, etc.). Is this approach correct?
3. **Data Storage**: We will create a new file `src/data/presentationTemplates.json` to store these full flows. Each template will define `metadata` (theme), an array of `nodes` (the slides), and `edges` (the linear progression). Does this architectural approach sound good?

## Phase 1: Planning and Architecture

### 1. Data Structure (`src/data/presentationTemplates.json`)
- Create a new JSON registry containing complete presentation structures:
  - `id`: string
  - `name`: string
  - `thumbnail`: string
  - `brand`: BrandKit object (colors: black, red, white, etc.)
  - `nodes`: Array of pre-configured Craft.js nodes (Title, Agenda, Content).
  - `edges`: Linear edges connecting the nodes sequentially.

### 2. UI/UX: Template Selection
- Add a new "Templates" section in the Main Dashboard (`Home.tsx`) or a "New from Template" modal.
- Display cards with thumbnails of the available Presentation Templates.
- When clicked, prompt the user: "This will replace your current presentation. Continue?" (if applicable).

### 3. State Management (`App.tsx`)
- Add a function `loadPresentationTemplate(templateId)` that:
  1. Fetches the template data from `presentationTemplates.json`.
  2. Updates the `metadata` state (applying the black & red brand colors).
  3. Updates `nodes` and `edges` with the template's predefined flow.
  4. Switches the view to the `canvas` mode to start editing.

## Phase 2: Implementation Steps (Post-Approval)
1. **Create Template Registry**: Set up `presentationTemplates.json` with the "Black and Red Minimalist" kickoff model.
2. **Build the Model**: Create 3-5 distinct slide layouts in JSON (e.g., Cover, Intro, Bullet Points, Outro) styled with the requested minimalist theme.
3. **Update Dashboard UI**: Add a dedicated area/button for "Apresentações Prontas" (Full Templates) on the Home screen.
4. **Wire Logic**: Implement the loading logic in `App.tsx` mapped to the selected template.

## Phase 3: Verification
- Verify that selecting a template generates the correct number of slides.
- Verify that the layout components perfectly map to the requested visual style.
- Ensure the brand variables (Black & Red) are properly bound to the components upon load.
