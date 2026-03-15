---
name: slideflow-templates
description: Principles and guidelines for creating full presentation templates and slide layouts in Slideflow using the Craft.js serialized JSON format.
---

# 🎨 Slideflow Template Authoring Guide

> **MANDATORY:** Use this guide whenever a user asks you to create a new presentation template, add slides to an existing template, or modify slide layouts within `src/data/presentationTemplates.json` or `src/data/slideTemplates.json`.

Slideflow uses a dual-engine architecture:
- **React Flow** manages the macro-level presentation flow.
- **Craft.js** manages the micro-level slide layout (serialized as JSON).

This guide explains how to properly structure templates inside the system.

## 📁 1. Target Files
- `src/data/presentationTemplates.json`: For **Full Presentations** (complete decks with themes and multiple slides).
- `src/data/slideTemplates.json`: For **Individual Slide Layouts** (single block layouts).

---

## 🏗️ 2. Full Presentation Template Schema

When adding a full presentation to `src/data/presentationTemplates.json`, you must follow this exact structure:

```json
{
  "id": "template_unique_id",
  "name": "Human Readable Template Name",
  "description": "Short description of the template's style and purpose.",
  "thumbnail": "URL to a representative image (e.g., Unsplash)",
  "brand": {
    "colors": {
      "primary": "#HEX",
      "secondary": "#HEX",
      "background": "#HEX",
      "surface": "#HEX",
      "text": "#HEX"
    },
    "fonts": {
      "title": "Inter, sans-serif",
      "header": "Inter, sans-serif",
      "subheader": "Inter, sans-serif",
      "body": "Inter, sans-serif"
    },
    "fontSizes": { "title": 80, "header": 48, "subheader": 24, "body": 18 },
    "fontWeights": { "title": "900", "header": "700", "subheader": "500", "body": "400" }
  },
  "slides": [
    {
      "label": "Slide Title (e.g., Cover)",
      "layout": "ESCAPED_JSON_STRING_OF_THE_CRAFTJS_TREE"
    }
  ]
}
```

---

## 🧩 3. Craft.js Layout Architecture (The `layout` String)

The `layout` parameter in a slide must be a **stringified JSON object** representing the Craft.js node tree.
**🚨 CRITICAL:** Do NOT write raw JSON here. You must format it as a valid JSON object and then escape it into a string format.

### The Component Sandbox
The root component is always a generic `Container` with the key `"ROOT"`.
Every other component must exist inside `"ROOT"` or another `Container`.

#### Base Object properties
Every node requires:
- `type`: `{"resolvedName": "Container" | "Text" | "Title" | "Image"}`
- `isCanvas`: `true` for Containers that can hold other items, `false` otherwise.
- `props`: Object defining the CSS properties (flexbox, color, fontSize, text, padding, etc.).
- `displayName`: matches the resolvedName.
- `custom`: `{}`
- `hidden`: `false`
- `nodes`: `[array_of_child_node_ids]` (Only for Containers)
- `parent`: `"ID_OF_PARENT_NODE"` (Omitted for ROOT)
- `linkedNodes`: `{}`

### Example Layout Tree:
If we have a "ROOT" container with one "Title" (`title_1`), the unescaped object looks like this:

```json
{
  "ROOT": {
    "type": { "resolvedName": "Container" },
    "isCanvas": true,
    "props": {
      "padding": 60,
      "background": "#FFFFFF",
      "height": "100%",
      "flexDirection": "column",
      "justifyContent": "center",
      "alignItems": "center"
    },
    "displayName": "Container",
    "custom": {},
    "hidden": false,
    "nodes": ["title_1"],
    "linkedNodes": {}
  },
  "title_1": {
    "type": { "resolvedName": "Title" },
    "isCanvas": false,
    "props": {
      "text": "HELLO WORLD",
      "fontSize": 96,
      "color": "#000000",
      "textAlign": "center",
      "fontWeight": "900",
      "fontFamily": "Inter, sans-serif"
    },
    "displayName": "Title",
    "custom": {},
    "parent": "ROOT",
    "hidden": false,
    "nodes": [],
    "linkedNodes": {}
  }
}
```

**⚠️ The final value in the JSON file must be stringified:**
```json
"layout": "{\"ROOT\":{\"type\":{\"resolvedName\":\"Container\"}...},\"title_1\":{...}}"
```

---

## ⚙️ 4. Layout & Styling Guidelines

To ensure the template renders correctly and beautifully, adhere to the following Flexbox rules inside the `props`:

1.  **Canvas Constraints**: The presentations have a 16:9 aspect ratio standard. The `ROOT` container should always have `"height": "100%"`.
2.  **Flexbox Properties**: Use standard React/CSS flex properties in `props`:
    *   `flexDirection`: `"row"` | `"column"`
    *   `justifyContent`: `"center"` | `"flex-start"` | `"flex-end"` | `"space-between"`
    *   `alignItems`: `"center"` | `"flex-start"` | `"flex-end"`
    *   `gap`: `20` (use pixel numbers instead of strings when possible)
    *   `padding`: `40` (number)
3.  **Colors**: Reference the global theme variables configured in the `brand` object if you want them to match correctly. When the App loads the template, it applies the brand colors to the elements. Standard practice: Use explicit hex codes in the `props` matching the brand theme of the template so they load correctly before any theme swap overrides them.
4.  **Available Components**:
    *   `Container`: For layout and spacing. Supports `background`, `padding`, `gap`, `borderRadius`, flex properties.
    *   `Title`: For main headings. Supports `text`, `fontSize`, `fontWeight`, `color`, `textAlign`.
    *   `Text`: For body text. Supports `text`, `fontSize`, `color`, `textAlign`, `lineHeight` (Markdown supported for text).
    *   `Image`: For media. Supports `src`, `objectFit`, `borderRadius`.

---

## 🤖 5. Step-by-Step AI Workflow

When creating a new template, follow these steps linearly:

1.  **Analyze Request**: Understand the style, vibe, and required slides (e.g., "Cyberpunk Pitch Deck").
2.  **Define Brand**: Create the JSON object for the brand (colors, fonts).
3.  **Draft Nodes (Memory/Scratchpad)**: Design the `ROOT` and child nodes for each slide unescaped. Mentally map the Flexbox layout.
4.  **Stringify Layout**: Convert the drafted node object into a properly escaped one-line JSON string.
5.  **Inject into Array**: Insert the new template object into `presentationTemplates.json`.

---

## 🛑 Common Pitfalls (DO NOT DO THIS)
*   **Forgetting to Link Nodes**: If you create a `subtitle_1` node, you MUST add `"subtitle_1"` to the `"nodes": []` array of its parent container. If not, it will be orphaned.
*   **Leaving out `parent`**: Every node except `ROOT` must explicitly declare `"parent": "ROOT"` (or the ID of whatever container holds it).
*   **Syntax Errors in Stringified JSON**: Ensure quotes are properly escaped (`\"`) when creating the `layout` string. Do NOT leave trailing commas inside the stringified JSON.
