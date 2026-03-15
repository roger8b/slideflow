---
name: slideflow-create
description: Creates complete slide deck presentations for the SlideFlow app and generates .slideflow.json files ready to load. Use this skill whenever the user wants to create a presentation, generate slides, build a deck, create a pitch, produce speaker slides, or build any kind of slide content — even if they just say "make slides about X" or "I need a presentation on Y". Trigger on phrases like "create slides", "make a presentation", "generate a deck", "build a pitch", "slideflow presentation", "criar slides", "fazer apresentação", "gerar deck". Also trigger when the user describes content they want on slides, even casually like "can you make something I can present to my team about our Q3 results?".
---

# SlideFlow Presentation Creator

You generate complete `.slideflow.json` presentations that can be loaded directly into the SlideFlow app via File → Load Presentation.

## Quick workflow

1. **Gather requirements** — understand topic, audience, tone, and number of slides
2. **Plan slide structure** — choose types and content
3. **Build the spec JSON** — a structured description of each slide
4. **Run the generator** — produce the `.slideflow.json` file using the bundled script
5. **Deliver** — save to disk and tell the user where it is

**Critical:** Always use the bundled Python script (`scripts/generate_presentation.py`) to produce the final file. Never hand-write Craft.js layout JSON — the serialization is complex and error-prone. The script handles all JSON escaping correctly.

---

## Step 1 — Gather Requirements

If the user hasn't provided enough detail, ask:
- **Topic**: What is the presentation about?
- **Audience**: Who will see it? (client, team, investors, students…)
- **Tone**: Professional / casual / bold / minimal?
- **Approx. slides**: Any preference, or should you decide?
- **Color scheme**: Any brand colors, or use your judgment?

For casual requests ("make me slides about X"), just decide intelligently and proceed — don't over-ask.

---

## Step 2 — Plan Slide Structure

A well-structured deck follows a narrative arc. Good default structures:

**Short deck (4–6 slides):** Cover → Agenda → 2–3 Content → Conclusion
**Medium deck (7–10 slides):** Cover → Agenda → Content sections → Big Number or Quote → Conclusion
**Long deck (11+ slides):** Cover → Agenda → multiple Content + Two-Column sections → Quote → Conclusion

### Available slide types

| Type | When to use |
|------|-------------|
| `cover` | Opening slide — title + subtitle |
| `agenda` | List of topics/sections (numbered) |
| `content` | Text + bullets, main content workhorse |
| `two_columns` | Compare two options, before/after, pros/cons |
| `big_number` | Highlight a stat or metric dramatically |
| `quote` | Testimonial or memorable quote |
| `image_full` | Full-bleed image with optional caption |
| `conclusion` | Closing slide — thank you, CTA, or summary |

---

## Step 3 — Build the Spec JSON

Create a temp file `/tmp/presentation_spec.json` with this structure:

```json
{
  "metadata": {
    "title": "Presentation Title",
    "author": "Author Name",
    "theme": "modern"
  },
  "slides": [
    {
      "label": "Capa",
      "type": "cover",
      "background": "#1a1a2e",
      "accent": "#e94560",
      "text_color": "#ffffff",
      "content": {
        "eyebrow": "Optional small label above title",
        "title": "Main Title Here",
        "subtitle": "Supporting subtitle or tagline"
      }
    },
    {
      "label": "Agenda",
      "type": "agenda",
      "background": "#16213e",
      "accent": "#e94560",
      "text_color": "#ffffff",
      "content": {
        "title": "Agenda",
        "items": ["Topic One", "Topic Two", "Topic Three"]
      }
    },
    {
      "label": "Content Slide",
      "type": "content",
      "background": "#0f3460",
      "accent": "#e94560",
      "text_color": "#ffffff",
      "text_color_muted": "#ccd6f6",
      "content": {
        "title": "Section Title",
        "icon": "Zap",
        "body": "Optional paragraph text goes here.",
        "bullets": ["Key point one", "Key point two", "Key point three"]
      }
    },
    {
      "label": "Comparison",
      "type": "two_columns",
      "background": "#1a1a2e",
      "accent": "#00b4d8",
      "text_color": "#ffffff",
      "text_color_muted": "#ccd6f6",
      "content": {
        "title": "Compare Options",
        "left": {
          "title": "Option A",
          "items": ["Benefit 1", "Benefit 2"]
        },
        "right": {
          "title": "Option B",
          "items": ["Feature X", "Feature Y"]
        }
      }
    },
    {
      "label": "Key Metric",
      "type": "big_number",
      "background": "#e94560",
      "text_color": "#ffffff",
      "content": {
        "number": "98%",
        "label": "Customer Satisfaction",
        "description": "Based on 2024 survey of 1,200 users"
      }
    },
    {
      "label": "Quote",
      "type": "quote",
      "background": "#2d2d2d",
      "accent": "#e94560",
      "text_color": "#ffffff",
      "content": {
        "text": "The quote text goes here, kept concise and impactful.",
        "author": "Name, Title"
      }
    },
    {
      "label": "Encerramento",
      "type": "conclusion",
      "background": "#e94560",
      "text_color": "#ffffff",
      "content": {
        "title": "Obrigado!",
        "subtitle": "nome@empresa.com · @handle"
      }
    }
  ]
}
```

### Color guidance

Choose colors that tell a visual story. Pick a palette with:
- **background**: dark base (e.g. `#1a1a2e`, `#0d1117`, `#1e1e2e`)
- **accent**: one bold highlight color (e.g. `#e94560`, `#00b4d8`, `#7c3aed`, `#f59e0b`)
- **text_color**: near-white for dark backgrounds (`#ffffff`, `#f8f8f2`)
- **text_color_muted**: softer secondary text (`#ccd6f6`, `#94a3b8`)

Vary backgrounds slightly across slides (e.g. `#1a1a2e` → `#16213e` → `#0f3460`) to create visual rhythm while keeping the palette cohesive. For the conclusion slide, use the accent color as the full background for high energy.

### Icon names (for content slides)
Use [lucide.dev](https://lucide.dev) icon names (PascalCase): `Zap`, `Target`, `Users`, `TrendingUp`, `Star`, `Shield`, `Rocket`, `Globe`, `BarChart2`, `CheckCircle`, `AlertTriangle`, `Lightbulb`, `Code`, `Database`, `Cloud`, `Lock`, `Heart`, `Award`.

---

## Step 4 — Run the Generator Script

Find this SKILL.md's location to get the script path, then run:

```bash
python3 /path/to/.claude/skills/slideflow-create/scripts/generate_presentation.py \
  /tmp/presentation_spec.json \
  /tmp/output_presentation.slideflow.json
```

The script outputs the `.slideflow.json` file and prints how many slides were generated.

**To find the skill path:** look for `SKILL.md` in `.claude/skills/slideflow-create/` relative to the project root, or search with `find ~ -path "*slideflow-create/scripts/generate_presentation.py" 2>/dev/null | head -1`.

---

## Step 5 — Deliver to User

1. Tell the user the output file path
2. Explain how to load it in SlideFlow: **click the folder icon (top-left) → Load Presentation** → select the `.slideflow.json` file
3. Offer to adjust anything — colors, content, number of slides

---

## Important details

- All slides are **960×540px** (16:9). Keep text concise — this is a visual medium, not a document.
- The `data.layout` field is a **JSON string** — the Python script handles serialization correctly, so never try to hand-write that field.
- Slide labels (shown in the canvas) should be short: "Capa", "Agenda", "Mercado", "Solução", "Obrigado".
- Node positions increase by 1040px on the X axis so slides don't overlap in the canvas.
- Use Portuguese labels and content when the user communicates in Portuguese.

---

## Example delivery message

> Criei sua apresentação com 7 slides em `/tmp/minha_apresentação.slideflow.json`.
> Para abrir: no SlideFlow, clique no ícone de pasta (canto superior esquerdo) → **Load Presentation** → selecione o arquivo.
> Quer ajustar cores, conteúdo ou adicionar mais slides?
