# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at localhost:3000
npm run build     # Production build (output: /dist)
npm run preview   # Preview production build
npm run lint      # TypeScript type-check (no emit)
npm run clean     # Remove dist directory
```

No test suite is configured. The `lint` command is the primary correctness check.

## Environment

Create a `.env` file with:
```
GEMINI_API_KEY=your_key_here
```
AI layout generation (Gemini 2.5 Flash) won't work without this. The key is injected at build time via Vite's `define`.

## Architecture

Slideflow is a graph-based presentation editor built on two core engines:

- **ReactFlow** — manages slide topology (nodes = slides, edges = navigation paths between slides)
- **Craft.js** — manages content composition inside each slide (a serialized component tree stored as JSON)

### Dual-State Model

Each slide node carries a `data.layout` field — a Craft.js-serialized JSON string. When a slide is opened for editing, `EditorContainer` deserializes this JSON into a live Craft.js editor. On close, the serialized JSON is written back to the ReactFlow node. This means ReactFlow and Craft.js never share live state — they hand off via serialized JSON.

### App Modes

`App.tsx` tracks two modes:
- `canvas` — the main graph view where users arrange slides and navigate the topology
- `player` — full-screen presentation mode that follows edges for navigation, including branching (multiple outgoing edges = choice screen)

### Component Hierarchy

```
App.tsx (SlideFlowContent)
├── ReactFlow canvas
│   └── CustomNode (960×540px per slide, Craft.js in read-only mode)
├── EditorContainer (modal, full-screen Craft.js editor)
│   ├── FloatingToolbar (draggable component palette)
│   ├── LayersTree (Craft.js hierarchy)
│   └── SettingsPanel (right sidebar, component properties)
└── Left sidebar panels (TemplatesPanel, BrandKitPanel, LayersTree)
```

### Craft.js Selectors

Components available in the editor live in `src/components/editor/selectors/`:
- `Container` — layout block with background, padding, flex/grid
- `Title`, `Text` — typography nodes
- `Image` — image with URL or upload
- `Icon` — lucide-react icon picker

Each selector exports a Craft.js config (craft property) defining which settings appear in `SettingsPanel`.

### State Persistence

| Data | Storage |
|------|---------|
| Presentation (nodes + edges + viewport) | `.slideflow.json` file (save/load) |
| Presentation metadata | `localStorage: slideflow-metadata` |
| Brand kits | `localStorage: slideflow-brand-kits` |
| Saved reusable blocks | `localStorage: slideflow_saved_blocks` |

When blocks are saved/deleted, a `savedBlocksUpdated` custom DOM event is dispatched for cross-component reactivity.

### Theme System

`App.tsx` has a `applyThemeToLayout()` function that recursively walks serialized Craft.js JSON and mutates color/font values to apply a global theme (`modern`, `classic`, `dark`, `glass`). This is applied at save time to all slides.

### Brand System

Brand kits define semantic tokens (`--brand-primary`, `--brand-font-heading`, etc.) injected as CSS variables. Components use these via `SettingsPanel` dropdowns — they don't hardcode colors, they reference brand tokens. Deep merge with defaults ensures resilience against partial brand configs.

### AI Layout Generation

`src/lib/geminiService.ts` calls Gemini 2.5 Flash. The AI Layout Generator (`src/components/editor/AILayoutGenerator.tsx`) takes a text prompt and returns a Craft.js-compatible JSON layout, which is deserialized directly into the active editor.

### Canvas Dimensions

All slides are fixed at **960×540px** (16:9). `CustomNode` renders at this size and uses `transform: scale()` to fit the ReactFlow viewport. This prevents scaling issues in presentation mode.

### Path Alias

`@/` resolves to the repo root (configured in both `vite.config.ts` and `tsconfig.json`).
