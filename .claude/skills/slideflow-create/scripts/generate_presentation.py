#!/usr/bin/env python3
"""
Generate a .slideflow.json presentation file from a structured JSON specification.

Usage:
    python generate_presentation.py <spec.json> <output.slideflow.json>
    python generate_presentation.py <spec.json>   # writes <title>.slideflow.json

Spec format:
{
  "metadata": {
    "title": "Presentation Title",
    "author": "Author Name",
    "theme": "modern"   // modern | classic | dark | glass
  },
  "slides": [
    {
      "label": "Cover",
      "type": "cover",            // cover | agenda | content | two_columns | big_number | quote | image_full | conclusion
      "background": "#1a1a2e",   // hex color for slide background
      "accent": "#e94560",       // accent color for details
      "text_color": "#ffffff",   // primary text color
      "content": { ... }         // varies by slide type — see below
    }
  ]
}

Content schemas per slide type:
  cover:       { title, subtitle?, eyebrow? }
  agenda:      { title, items: string[] }
  content:     { title, body?, bullets?: string[], icon? }
  two_columns: { title, left: {title, items: string[]}, right: {title, items: string[]} }
  big_number:  { number, label, description? }
  quote:       { text, author? }
  image_full:  { src, caption? }
  conclusion:  { title, subtitle? }
"""

import json
import sys
import time
from typing import Any


class NodeBuilder:
    """Builds a flat Craft.js node tree."""

    def __init__(self):
        self._counter = 0
        self.nodes: dict[str, Any] = {}

    def _next_id(self, prefix="n") -> str:
        self._counter += 1
        return f"{prefix}_{self._counter}"

    def _base(self, resolved_name: str, is_canvas: bool, props: dict,
              children: list, parent: str) -> str:
        node_id = self._next_id(resolved_name.lower())
        node = {
            "type": {"resolvedName": resolved_name},
            "isCanvas": is_canvas,
            "props": props,
            "nodes": children,
            "parent": parent,
            "displayName": resolved_name,
            "custom": {},
            "hidden": False,
            "linkedNodes": {},
        }
        self.nodes[node_id] = node
        return node_id

    def container(self, parent: str, children=None, **props) -> str:
        defaults = {
            "display": "flex",
            "flexDirection": "column",
            "alignItems": "flex-start",
            "justifyContent": "flex-start",
            "background": "transparent",
            "padding": 0,
            "gap": 0,
            "width": "100%",
            "height": "auto",
        }
        defaults.update(props)
        return self._base("Container", True, defaults, children or [], parent)

    def title(self, parent: str, text: str, **props) -> str:
        defaults = {
            "text": text,
            "fontSize": 48,
            "color": "#ffffff",
            "textAlign": "left",
            "fontWeight": "bold",
        }
        defaults.update(props)
        return self._base("Title", False, defaults, [], parent)

    def text(self, parent: str, content: str, **props) -> str:
        defaults = {
            "text": content,
            "fontSize": 20,
            "color": "#ffffff",
            "textAlign": "left",
        }
        defaults.update(props)
        return self._base("Text", False, defaults, [], parent)

    def icon(self, parent: str, name: str, **props) -> str:
        defaults = {
            "name": name,
            "size": 32,
            "color": "#ffffff",
            "strokeWidth": 1.5,
            "background": "transparent",
            "padding": 0,
            "borderRadius": 0,
        }
        defaults.update(props)
        return self._base("Icon", False, defaults, [], parent)

    def image(self, parent: str, src: str, **props) -> str:
        defaults = {
            "src": src,
            "width": "100%",
            "height": "auto",
            "borderRadius": 0,
        }
        defaults.update(props)
        return self._base("Image", False, defaults, [], parent)

    def add_children(self, parent_id: str, children: list):
        self.nodes[parent_id]["nodes"].extend(children)

    def build(self, root_children: list, root_props=None) -> str:
        root_defaults = {
            "display": "flex",
            "flexDirection": "column",
            "alignItems": "center",
            "justifyContent": "center",
            "background": "#1a1a2e",
            "padding": 48,
            "gap": 0,
            "width": "100%",
            "height": "100%",
        }
        if root_props:
            root_defaults.update(root_props)

        root = {
            "type": {"resolvedName": "Container"},
            "isCanvas": True,
            "props": root_defaults,
            "nodes": root_children,
            "parent": None,
            "displayName": "Container",
            "custom": {},
            "hidden": False,
            "linkedNodes": {},
        }
        tree = {"ROOT": root, **self.nodes}
        return json.dumps(tree)


# ---------------------------------------------------------------------------
# Slide builders
# ---------------------------------------------------------------------------

def build_cover(slide: dict) -> str:
    c = slide.get("content", {})
    bg = slide.get("background", "#1a1a2e")
    accent = slide.get("accent", "#e94560")
    tc = slide.get("text_color", "#ffffff")

    nb = NodeBuilder()
    children = []

    if c.get("eyebrow"):
        eid = nb.text("ROOT", c["eyebrow"],
                      fontSize=13, color=accent, textAlign="center", fontWeight="600")
        children.append(eid)

    tid = nb.title("ROOT", c.get("title", "Untitled"),
                   fontSize=64, color=tc, textAlign="center", fontWeight="bold")
    children.append(tid)

    bar_id = nb.container("ROOT", children=[],
                          background=accent, height="4px", width="64px",
                          borderRadius=2, alignSelf="center", margin="16px 0")
    children.append(bar_id)

    if c.get("subtitle"):
        sid = nb.text("ROOT", c["subtitle"],
                      fontSize=22, color=tc, textAlign="center", fontWeight="400")
        children.append(sid)

    return nb.build(children, {
        "background": bg, "alignItems": "center",
        "justifyContent": "center", "gap": 16, "padding": 64,
    })


def build_agenda(slide: dict) -> str:
    c = slide.get("content", {})
    bg = slide.get("background", "#16213e")
    accent = slide.get("accent", "#e94560")
    tc = slide.get("text_color", "#ffffff")

    nb = NodeBuilder()
    children = []

    tid = nb.title("ROOT", c.get("title", "Agenda"),
                   fontSize=40, color=tc, textAlign="left", fontWeight="bold")
    children.append(tid)

    sep = nb.container("ROOT", children=[],
                       background=accent, height="3px", width="48px",
                       borderRadius=2, margin="8px 0 24px 0")
    children.append(sep)

    for i, item in enumerate(c.get("items", [])):
        row_id = nb.container("ROOT", children=[],
                              flexDirection="row", alignItems="center",
                              gap=16, padding="8px 0", height="auto")
        num_id = nb.container(row_id, children=[],
                              background=accent, width="32px", height="32px",
                              borderRadius=16, alignItems="center",
                              justifyContent="center", flexShrink="0")
        nb_label = nb.text(num_id, str(i + 1),
                           fontSize=14, color="#ffffff", textAlign="center", fontWeight="bold")
        nb.add_children(num_id, [nb_label])
        nb.add_children(row_id, [num_id])
        item_txt = nb.text(row_id, item, fontSize=20, color=tc, textAlign="left")
        nb.add_children(row_id, [item_txt])
        children.append(row_id)

    return nb.build(children, {
        "background": bg, "alignItems": "flex-start",
        "justifyContent": "center", "gap": 4, "padding": 56,
    })


def build_content(slide: dict) -> str:
    c = slide.get("content", {})
    bg = slide.get("background", "#0f3460")
    accent = slide.get("accent", "#e94560")
    tc = slide.get("text_color", "#ffffff")
    tc_muted = slide.get("text_color_muted", "#ccd6f6")

    nb = NodeBuilder()
    children = []

    if c.get("icon"):
        icon_id = nb.icon("ROOT", c["icon"], size=40, color=accent)
        children.append(icon_id)

    tid = nb.title("ROOT", c.get("title", "Section"),
                   fontSize=38, color=tc, textAlign="left", fontWeight="bold")
    children.append(tid)

    sep = nb.container("ROOT", children=[],
                       background=accent, height="3px", width="40px",
                       borderRadius=2, margin="8px 0 16px 0")
    children.append(sep)

    if c.get("body"):
        bid = nb.text("ROOT", c["body"], fontSize=19, color=tc_muted, textAlign="left")
        children.append(bid)

    for bullet in c.get("bullets", []):
        row_id = nb.container("ROOT", children=[],
                              flexDirection="row", alignItems="flex-start",
                              gap=12, padding="6px 0", height="auto")
        dot_id = nb.container(row_id, children=[],
                              background=accent, width="6px", height="6px",
                              borderRadius=3, margin="8px 0 0 0", flexShrink="0")
        nb.add_children(row_id, [dot_id])
        btxt = nb.text(row_id, bullet, fontSize=18, color=tc_muted, textAlign="left")
        nb.add_children(row_id, [btxt])
        children.append(row_id)

    return nb.build(children, {
        "background": bg, "alignItems": "flex-start",
        "justifyContent": "center", "gap": 8, "padding": 56,
    })


def build_two_columns(slide: dict) -> str:
    c = slide.get("content", {})
    bg = slide.get("background", "#1a1a2e")
    accent = slide.get("accent", "#e94560")
    tc = slide.get("text_color", "#ffffff")
    tc_muted = slide.get("text_color_muted", "#ccd6f6")

    nb = NodeBuilder()
    children = []

    tid = nb.title("ROOT", c.get("title", "Comparison"),
                   fontSize=38, color=tc, textAlign="left", fontWeight="bold")
    children.append(tid)

    sep = nb.container("ROOT", children=[],
                       background=accent, height="3px", width="40px",
                       borderRadius=2, margin="8px 0 24px 0")
    children.append(sep)

    row_id = nb.container("ROOT", children=[],
                          flexDirection="row", alignItems="flex-start",
                          gap=32, height="auto", width="100%", flex="1")

    def build_col(col_data: dict, parent_id: str) -> str:
        col_id = nb.container(parent_id, children=[],
                              flexDirection="column", gap=12, flex="1",
                              background="rgba(255,255,255,0.05)",
                              padding=24, borderRadius=8, height="auto",
                              alignItems="flex-start")
        ctitle = nb.title(col_id, col_data.get("title", ""),
                          fontSize=22, color=accent, textAlign="left", fontWeight="bold")
        nb.add_children(col_id, [ctitle])
        for item in col_data.get("items", []):
            irow = nb.container(col_id, children=[],
                                flexDirection="row", alignItems="flex-start",
                                gap=10, padding="4px 0", height="auto")
            dot = nb.container(irow, children=[],
                               background=accent, width="5px", height="5px",
                               borderRadius=3, margin="8px 0 0 0", flexShrink="0")
            nb.add_children(irow, [dot])
            itxt = nb.text(irow, item, fontSize=16, color=tc_muted, textAlign="left")
            nb.add_children(irow, [itxt])
            nb.add_children(col_id, [irow])
        return col_id

    left_id = build_col(c.get("left", {"title": "Left", "items": []}), row_id)
    right_id = build_col(c.get("right", {"title": "Right", "items": []}), row_id)
    nb.add_children(row_id, [left_id, right_id])
    children.append(row_id)

    return nb.build(children, {
        "background": bg, "alignItems": "flex-start",
        "justifyContent": "flex-start", "gap": 0, "padding": 56,
    })


def build_big_number(slide: dict) -> str:
    c = slide.get("content", {})
    bg = slide.get("background", "#e94560")
    tc = slide.get("text_color", "#ffffff")
    tc_muted = slide.get("text_color_muted", "rgba(255,255,255,0.8)")

    nb = NodeBuilder()
    children = []

    num_id = nb.title("ROOT", c.get("number", "0"),
                      fontSize=120, color=tc, textAlign="center", fontWeight="bold")
    children.append(num_id)

    label_id = nb.title("ROOT", c.get("label", ""),
                        fontSize=28, color=tc, textAlign="center", fontWeight="600")
    children.append(label_id)

    if c.get("description"):
        desc_id = nb.text("ROOT", c["description"],
                          fontSize=18, color=tc_muted, textAlign="center")
        children.append(desc_id)

    return nb.build(children, {
        "background": bg, "alignItems": "center",
        "justifyContent": "center", "gap": 8, "padding": 64,
    })


def build_quote(slide: dict) -> str:
    c = slide.get("content", {})
    bg = slide.get("background", "#2d2d2d")
    accent = slide.get("accent", "#e94560")
    tc = slide.get("text_color", "#ffffff")

    nb = NodeBuilder()
    children = []

    qmark = nb.title("ROOT", "\u201c", fontSize=120, color=accent,
                     textAlign="left", fontWeight="bold")
    children.append(qmark)

    quote_id = nb.title("ROOT", c.get("text", ""),
                        fontSize=28, color=tc, textAlign="left", fontWeight="400")
    children.append(quote_id)

    if c.get("author"):
        auth_id = nb.text("ROOT", f"\u2014 {c['author']}",
                          fontSize=18, color=accent, textAlign="left", fontWeight="600")
        children.append(auth_id)

    return nb.build(children, {
        "background": bg, "alignItems": "flex-start",
        "justifyContent": "center", "gap": 0, "padding": "48px 72px",
    })


def build_image_full(slide: dict) -> str:
    c = slide.get("content", {})
    bg = slide.get("background", "#000000")
    tc = slide.get("text_color", "#ffffff")

    nb = NodeBuilder()
    children = []

    img_id = nb.image("ROOT", c.get("src", ""),
                      width="100%", height="100%", borderRadius=0)
    children.append(img_id)

    if c.get("caption"):
        cap_row = nb.container("ROOT", children=[],
                               background="rgba(0,0,0,0.6)",
                               padding="12px 24px", height="auto",
                               width="100%", alignItems="center")
        cap_txt = nb.text(cap_row, c["caption"],
                          fontSize=16, color=tc, textAlign="center")
        nb.add_children(cap_row, [cap_txt])
        children.append(cap_row)

    return nb.build(children, {
        "background": bg, "alignItems": "center",
        "justifyContent": "center", "padding": 0, "gap": 0,
        "flexDirection": "column",
    })


def build_conclusion(slide: dict) -> str:
    c = slide.get("content", {})
    bg = slide.get("background", "#e94560")
    tc = slide.get("text_color", "#ffffff")
    tc_muted = slide.get("text_color_muted", "rgba(255,255,255,0.85)")

    nb = NodeBuilder()
    children = []

    tid = nb.title("ROOT", c.get("title", "Thank You!"),
                   fontSize=72, color=tc, textAlign="center", fontWeight="bold")
    children.append(tid)

    bar = nb.container("ROOT", children=[],
                       background="rgba(255,255,255,0.5)", height="3px",
                       width="64px", borderRadius=2,
                       alignSelf="center", margin="16px 0")
    children.append(bar)

    if c.get("subtitle"):
        sid = nb.text("ROOT", c["subtitle"],
                      fontSize=24, color=tc_muted, textAlign="center")
        children.append(sid)

    return nb.build(children, {
        "background": bg, "alignItems": "center",
        "justifyContent": "center", "gap": 16, "padding": 64,
    })


SLIDE_BUILDERS = {
    "cover": build_cover,
    "agenda": build_agenda,
    "content": build_content,
    "two_columns": build_two_columns,
    "big_number": build_big_number,
    "quote": build_quote,
    "image_full": build_image_full,
    "conclusion": build_conclusion,
}


def build_layout(slide: dict) -> str:
    slide_type = slide.get("type", "content")
    builder = SLIDE_BUILDERS.get(slide_type, build_content)
    return builder(slide)


def generate(spec: dict) -> dict:
    import datetime
    meta = spec.get("metadata", {})
    base_time = int(time.time() * 1000)

    nodes = []
    edges = []

    for i, slide in enumerate(spec.get("slides", [])):
        node_id = f"node_{base_time}_{i}"
        layout = build_layout(slide)

        nodes.append({
            "id": node_id,
            "type": "custom",
            "position": {"x": i * 1040, "y": 0},
            "data": {
                "type": "custom",
                "label": slide.get("label", f"Slide {i + 1}"),
                "layout": layout,
            },
        })

    for i in range(len(nodes) - 1):
        src = nodes[i]["id"]
        tgt = nodes[i + 1]["id"]
        edges.append({
            "id": f"edge_{src}_{tgt}",
            "source": src,
            "target": tgt,
            "markerEnd": {"type": "arrowclosed", "color": "#495464"},
        })

    return {
        "metadata": {
            "title": meta.get("title", "Untitled Presentation"),
            "author": meta.get("author", ""),
            "version": "1.0",
            "createdAt": datetime.datetime.utcnow().isoformat() + "Z",
            "baseFontSize": 16,
            "theme": meta.get("theme", "modern"),
        },
        "nodes": nodes,
        "edges": edges,
        "viewport": {"x": 0, "y": 0, "zoom": 0.5},
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python generate_presentation.py <spec.json> [output.slideflow.json]")
        sys.exit(1)

    spec_path = sys.argv[1]
    with open(spec_path) as f:
        spec = json.load(f)

    presentation = generate(spec)

    if len(sys.argv) >= 3:
        out_path = sys.argv[2]
    else:
        title = presentation["metadata"]["title"].replace(" ", "_").lower()
        out_path = f"{title}.slideflow.json"

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(presentation, f, ensure_ascii=False, indent=2)

    print(f"Generated: {out_path} ({len(spec.get('slides', []))} slides)")


if __name__ == "__main__":
    main()
