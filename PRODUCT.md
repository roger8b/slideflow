# Slideflow: The Narrative Graph Engine

Slideflow is a next-generation presentation platform that replaces the linear "carousel" model with a dynamic, graph-based narrative engine. It allows creators to build interconnected content ecosystems where the story adapts to the audience's needs.

---

## 👁️ Product Vision
Traditional presentations are rigid. Slideflow treats ideas as **nodes** in a knowledge graph. By combining **React Flow** (for navigation logic) and **Craft.js** (for visual precision), Slideflow empowers users to design complex, branching stories that can be explored interactively.

## 🏗️ Technical Architecture

### 1. The Dual-Core Engine
- **Macro-Level (React Flow):** Manages the presentation's topology. It handles slide transitions, branching logic (bifurcations), and the spatial relationship between ideas.
- **Micro-Level (Craft.js):** A high-performance drag-and-drop editor embedded within each node. It serializes slide content into a nested JSON structure, allowing for extreme layout flexibility without the constraints of fixed templates.

### 2. AI-Augmented Design (Gemini 2.5)
The system integrates **Google Gemini 2.5 Flash** to bridge the gap between content and design. 
- **Prompt Engineering:** Uses a sophisticated System Prompt to translate natural language into structured Craft.js component trees.
- **Contextual Awareness:** The AI understands layout principles (e.g., side-by-side comparisons for "A vs B" prompts) and applies them automatically using Flexbox containers.

### 3. Reactive Styling System
Slideflow features a centralized theme engine that performs recursive updates on serialized Craft.js states. When a user changes a theme, the system:
- Traverses the JSON tree of every node.
- Injects new color tokens, font families, and spacing constants.
- Re-renders the entire graph instantly without data loss.

---

## 🛠️ Detailed Feature Set

### 🎨 The Visual Editor (Canvas Mode)
- **Component Palette:** Drag-and-drop Title, Text, Image, and Grid components.
- **Flexbox Layouts:** Containers support nested rows and columns with configurable gap, padding, and alignment.
- **Edge-Based Logic:** Connect nodes to define the next slide. Create multiple outgoing edges from one node to trigger a **Path Choice** in Player Mode.

### ⚡ Intelligence & Automation
- **AI Layout Generator:** Generate professional slide structures from prompts like "Compare two marketing strategies" or "Create a pricing table".
- **Real-time Serialization:** Slide data is continuously synced to the React Flow node data, ensuring no work is lost during navigation.

### 📽️ The Player Experience (Presentation Mode)
- **Immersive View:** Full-screen rendering with 32px base font scaling (configurable).
- **Non-Linear Navigation:** Navigate via "Next/Back" or click on specific paths when the story branches.
- **Motion Orchestration:** Smooth transitions between nodes powered by `motion/react` (Framer Motion).

---

## 📄 Data Specification: `.slideflow.json`

The project uses a unified JSON schema to ensure portability:

```json
{
  "metadata": {
    "title": "Strategy 2026",
    "theme": "modern",
    "baseFontSize": 32
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
    { "source": "node_1", "target": "node_2" }
  ]
}
```

## 🛤️ Roadmap & Future Evolution
- **Component Extensibility:** Support for custom React components (Charts, Code Snippets) within the Craft.js editor.
- **Collaborative Graphing:** Real-time multi-user editing of the presentation map.
- **AI-Powered Copywriting:** In-editor suggestions to refine slide text based on the presentation's overall goal.

---
*Document Version: 1.1 | March 2026*
