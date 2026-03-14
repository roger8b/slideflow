# Slideflow: The Narrative Graph Engine

Slideflow is a next-generation presentation platform that replaces the linear "carousel" model with a dynamic, graph-based narrative engine. It allows creators to build interconnected content ecosystems where the story adapts to the audience's needs.

---

## 👁️ Product Vision
Traditional presentations are rigid. Slideflow treats ideas as **nodes** in a knowledge graph. By combining **React Flow** (for navigation logic) and **Craft.js** (for visual precision), Slideflow empowers users to design complex, branching stories that can be explored interactively.

## 🏗️ Technical Architecture

### 1. The Dual-Core Engine
- **Macro-Level (React Flow):** Manages the presentation's topology. It handles slide transitions, branching logic (bifurcations), and the spatial relationship between ideas.
- **Micro-Level (Craft.js):** A high-performance drag-and-drop editor embedded within each node. It serializes slide content into a nested JSON structure, allowing for extreme layout flexibility.
- **Canvas Standardization:** Slides are locked to a **16:9 aspect ratio (960x540)** to ensure visual consistency across different display modes and export targets.

### 2. AI-Augmented Design (Gemini 2.5)
The system integrates **Google Gemini 2.5 Flash** to bridge the gap between content and design. 
- **Prompt Engineering:** Uses a sophisticated System Prompt to translate natural language into structured Craft.js component trees.
- **Contextual Awareness:** The AI understands layout principles and applies them automatically using Flexbox containers.

### 3. Reactive Styling System
Slideflow features a centralized theme engine that performs recursive updates on serialized Craft.js states. 
- **Global Tokens:** Injects color palettes, typography (including custom font families), and layout constants (padding, gap) across the entire flow.
- **Theme Modal:** Allows users to preview and apply design presets instantly.

---

## 🛠️ Detailed Feature Set

### 🎨 The Visual Editor (Canvas Mode)
- **Unified Node Editor:** All slides use a consistent, high-power editor, replacing legacy single-purpose nodes.
- **Component Palette:** Drag-and-drop Title, Text (with **Markdown support**), Image, and Grid components.
- **Floating Toolbar & Layers:** A modernized UI featuring a floating toolbar for quick actions and a layers tree for complex element management.
- **Flexbox Control:** Deep control over container alignment, flex distribution, and height properties (supporting both fixed and auto-computed values).

### ⚡ Intelligence & Automation
- **AI Layout Generator:** Integrated sidebar tool for generating layouts from prompts.
- **Reusable Blocks:** Capability to save custom component configurations as reusable blocks for faster authoring.
- **Keyboard Shortcuts:** Optimized for power users with a full set of accessibility and productivity shortcuts.

### 📽️ The Player Experience (Presentation Mode)
- **Immersive View:** Full-screen rendering with configurable base font scaling.
- **Non-Linear Navigation:** Navigate via "Next/Back" or click on specific paths when the story branches.
- **Motion Orchestration:** Smooth transitions between nodes powered by `motion/react`.

---

## 📄 Evolution & Milestones (Project History)

The development of Slideflow has followed a rapid, iterative path focused on user control and intelligent automation:

- **Phase 1: Foundation:** Integrated **Craft.js** and **React Flow** as the core engines.
- **Phase 2: Standardization:** Implemented the **16:9 Canvas standard** and consolidated all node types into a single versatile editor.
- **Phase 3: Content Enrichment:** Added **Markdown support** for text components and intelligent container styling logic.
- **Phase 4: Intelligence & Identity:** Integrated **Gemini AI** for automated layouts and launched the **Global Theming System**.
- **Phase 5: Refinement:** Enhanced the UI with a **floating toolbar**, **layers tree**, and optimized modal systems for a more professional workspace.
- **Phase 6: Advanced Identity & Layout Fidelity:** Completely revamped the **Brand Kit** settings with semantic dropdowns mapping to brand schemes, granular per-component dual-color controls (Text + Background), and secured Flexbox stability between the Design and Presentation modes.

---

## 📄 Data Specification: `.slideflow.json`

The project uses a unified JSON schema to ensure portability:

```json
{
  "metadata": {
    "title": "Strategy 2026",
    "theme": "modern",
    "baseFontSize": 32,
    "createdAt": "2026-03-14T..."
  },
  "nodes": [
    {
      "id": "node_1",
      "data": {
        "label": "Introduction",
        "layout": "{ \"ROOT\": { \"type\": \"Container\", \"props\": { ... } } }"
      }
    }
  ],
  "edges": [
    { "source": "node_1", "target": "node_2", "markerEnd": { "type": "arrowclosed" } }
  ]
}
```

---
*Document Version: 1.2 | Updated based on Commit History | March 2026*
