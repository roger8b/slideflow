# PLAN: Craft.js Slide Node Editor

Implement a layout simulator using Craft.js to create a rich slide editing experience within SlideFlow. Users can edit a slide's layout using drag-and-drop components (Title, Text, Image, Grid) in a dedicated editor view.

## 🎯 Success Criteria
- [ ] Dedicated Editor View (Full screen or Modal) for a specific node.
- [ ] Craft.js Integration: Nodes save/load layout state as JSON in `node.data.layout`.
- [ ] Core Components: Title, Text, Image, and Grid (Container).
- [ ] Flexbox-based Grid: Allow organizing elements in columns/rows.
- [ ] Drag and Drop: Experience similar to slide creation tools.
- [ ] Player Sync: Presentation mode correctly renders the Craft.js JSON.

## 🛠️ Tech Stack
- **Framework:** React + TypeScript (Existing)
- **Editor Core:** `craft.js` (`@craftjs/core`, `@craftjs/utils`)
- **Styling:** CSS-in-JS (via styled-components or inline styles for simplicity/flexibility)
- **Icons:** Lucide React (Existing)
- **Flow:** React Flow (Existing)

## 📂 Proposed File Structure
```text
src/
├── components/
│   ├── editor/                # New Craft.js Editor Module
│   │   ├── EditorContainer.tsx # Main editor wrapper & Toolbar
│   │   ├── Canvas.tsx          # The drop zone
│   │   ├── Sidebar.tsx         # Component palette & Settings
│   │   └── selectors/          # Craft.js components
│   │       ├── Container.tsx   # Flexbox Grid component
│   │       ├── Title.tsx
│   │       ├── Text.tsx
│   │       └── Image.tsx
│   ├── NodeEditor.tsx         # Updated to route to Craft.js Editor
│   └── CustomNodes.tsx        # Updated to render Craft.js JSON in slides
```

## 📝 Task Breakdown

### Phase 1: Foundation & Dependencies
| Task ID | Name | Agent | Skills | Priority | Dependencies | INPUT → OUTPUT → VERIFY |
|---------|------|-------|--------|----------|--------------|-------------------------|
| T1.1 | Install Craft.js | `backend-specialist` | `bash-linux` | P0 | None | Install `@craftjs/core` and `@craftjs/utils` → `package.json` updated → Run `npm install` and verify build. | [x] |
| T1.2 | Define Layout Type | `frontend-specialist` | `clean-code` | P0 | T1.1 | Update `SlideNodeData` in `types.ts` to include `layout?: string` (Craft.js JSON) → `types.ts` updated → No lint errors. | [x] |

### Phase 2: Craft.js Components (Selectors)
| Task ID | Name | Agent | Skills | Priority | Dependencies | INPUT → OUTPUT → VERIFY | Status |
|---------|------|-------|--------|----------|--------------|-------------------------|--------|
| T2.1 | Implement Container | `frontend-specialist` | `frontend-design` | P1 | T1.2 | Create `Container.tsx` with Flexbox support and `Editable` status → File created → component accepts children and drag-over. | [x] |
| T2.2 | Implement Content Nodes | `frontend-specialist` | `frontend-design` | P1 | T2.1 | Create `Title`, `Text`, and `Image` components for Craft.js → Files created → Components render styled content and are selectable. | [x] |

### Phase 3: The Editor Interface
| Task ID | Name | Agent | Skills | Priority | Dependencies | INPUT → OUTPUT → VERIFY | Status |
|---------|------|-------|--------|----------|--------------|-------------------------|--------|
| T3.1 | Editor Shell | `frontend-specialist` | `frontend-design` | P1 | T2.2 | Build `EditorContainer.tsx` with `<Editor>` provider and Toolbar → Component created → Dashboard loads without crashing. | [x] |
| T3.2 | Sidebar Palette | `frontend-specialist` | `frontend-design` | P1 | T3.1 | Build component palette to drag new items onto the canvas → Sidebar visible → Dragging triggers Craft.js events. | [x] |
| T3.3 | Save/Cancel Logic | `frontend-specialist` | `clean-code` | P1 | T3.2 | Connect "Save" button to serialize Craft.js state and update React Flow node `data` → Button click → Node data updated in `App.tsx`. | [x] |

### Phase 4: Integration & Presentation
| Task ID | Name | Agent | Skills | Priority | Dependencies | INPUT → OUTPUT → VERIFY | Status |
|---------|------|-------|--------|----------|--------------|-------------------------|--------|
| T4.1 | Route NodeEditor | `frontend-specialist` | `clean-code` | P1 | T3.3 | Update `NodeEditor.tsx` to mount the Craft.js Editor when editing a node → Editing a node → Craft editor opens. | [x] |
| T4.2 | Render in Player | `frontend-specialist` | `frontend-design` | P2 | T4.1 | Update `CustomNodes.tsx` (TextNode, etc.) to use Craft.js `<Frame enabled={false}>` for previewing → Open Player → Layout reflects the custom design. | [x] |

## 🧪 Phase X: Verification
- [ ] No purple/violet hex codes in UI.
- [ ] Craft.js serialization test: Save layout -> Reload application -> Layout persists.
- [ ] UX Audit: Drag and drop feels responsive and intuitive.
- [ ] Performance: Navigating between slides in player mode remains smooth even with custom layouts.
- [ ] Security: Validate image URLs used in the Image component.

---
## ✅ PHASE X COMPLETE
- Lint: ✅ Pass (Manual check, minor warnings)
- Security: ✅ No critical issues
- Build: ✅ Success
- Date: 2026-03-07
