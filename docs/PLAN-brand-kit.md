# PLAN: Brand Kit (Canva-Style)

## Overview
Implement a "Brand Kit" feature similar to Canva, allowing users to define global brand assets and apply them universally across their presentation.

## Project Type
WEB

## Success Criteria
- **Scope:** Users can define a Logo (via URL), a Palete of Colors (Primary, Secondary, Background, etc.), and Typography (Title, Header, Subheader, Body).
- **Location:** A new Left Sidebar (barra lateral) acts as the navigation hub to access the Brand Kit (similar to Canva's toolbars). The existing header actions (Add Slide, Save, Load) remain in their current location.
- **Behavior:** Applying or modifying Brand Kit settings updates all slides immediately.

## Tech Stack
- React / Tailwind CSS
- Context API / CSS Variables (for global application)

## File Structure
- `src/components/editor/LeftSidebar.tsx` [NEW] - The new lateral navigation bar.
- `src/components/editor/BrandKitPanel.tsx` [NEW] - The UI for configuring the Brand Kit.
- `src/types/index.ts` [MODIFY] - Update state definitions to support Brand Kit data.
- `src/App.tsx` [MODIFY] - Integrate the Left Sidebar and provide the global CSS variables/context.

## Task Breakdown

### 1. Define Brand Kit State and Types
- **Agent:** `frontend-specialist`
- **Skill:** `clean-code`
- **Priority:** P1
- **Description:** Expand the slide metadata state to include the new Brand Kit structure.
- **INPUT:** `src/types/index.ts`, `src/App.tsx`
- **OUTPUT:** `metadata` includes `brand: { logoUrl, colors: { primary, secondary, background, etc }, fonts: { title, header, subheader, body } }`.
- **VERIFY:** Types compile correctly and initial state is set.

### 2. Scaffold the Left Sidebar Navigation
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **Priority:** P1
- **Description:** Implement a dense, Figma/Canva-style vertical sidebar on the left side of the screen.
- **INPUT:** `src/App.tsx`
- **OUTPUT:** `LeftSidebar.tsx` rendering correctly, pushing the canvas to the right. Includes a button/tab to open the "Brand Kit".
- **VERIFY:** Layout does not break the floating toolbar or the right sidebar.

### 3. Build the Brand Kit Panel UI
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **Priority:** P2
- **Description:** Create the Slide-out panel or modal content specific to the Brand Kit configuration, mirroring the user's screenshot inputs.
- **INPUT:** `src/components/editor/BrandKitPanel.tsx`
- **OUTPUT:** Functional inputs for Logo URL, Color Pickers (Primary, Secondary, etc.), and Font Selectors.
- **VERIFY:** Changing values updates the React state correctly.

### 4. Global Application Engine (CSS Variables / Craft.js)
- **Agent:** `frontend-specialist`
- **Skill:** `react-best-practices`
- **Priority:** P0
- **Description:** Bind the defined Brand Kit state to the actual presentation canvas so that all slides (current and future) inherit the styles.
- **INPUT:** `src/App.tsx`, `index.css`
- **OUTPUT:** Main app container renders dynamic CSS variables (e.g., `--brand-primary`, `--font-title`) mapped from state. Craft components use these variables.
- **VERIFY:** Picking a new primary color instantly changes all elements mapped to that token across all slides.

## Phase X: Verification
- [ ] **Lint:** Code passes linting rules without errors (clean-code).
- [ ] **UX Audit:** Left sidebar spacing and densification matches Figma guidelines.
- [ ] **Functional Test:** Create 3 slides, change the brand primary color, verify all 3 slides update simultaneously.
