## ADDED Requirements

### Requirement: Text nodes support a textEffect prop
Title and Text Craft.js selector nodes SHALL accept an optional `textEffect` prop of type `TextEffect`. When absent or `type: 'none'`, rendering SHALL be identical to the current behavior (no visual change).

#### Scenario: No effect applied
- **WHEN** a Title or Text node has no `textEffect` prop (or `type: 'none'`)
- **THEN** the node renders without any additional CSS shadow, stroke, or background

#### Scenario: Effect persists across save/load
- **WHEN** a layout is saved to `.slideflow.json` and re-loaded
- **THEN** the `textEffect` prop is deserialized and the visual effect is restored correctly

---

### Requirement: Sombreado (shadow) effect
The Sombreado effect SHALL apply a CSS `text-shadow` computed from distance, direction, blur, opacity, and color parameters.

#### Scenario: Shadow renders with default params
- **WHEN** `textEffect.type === 'shadow'` with default values (distance=50, direction=-45, blur=0, opacity=40, color='#000000')
- **THEN** the node displays a drop shadow offset at -45°

#### Scenario: Shadow direction changes shadow offset
- **WHEN** direction is set to 90
- **THEN** the shadow offset shifts to 90° (purely horizontal offset)

#### Scenario: Shadow color changes
- **WHEN** shadowColor is set to a brand color token (e.g. `var(--brand-primary)`)
- **THEN** the resolved color is used for the shadow

---

### Requirement: Flutuante (float) effect
The Flutuante effect SHALL apply a soft downward `text-shadow` whose blur and offset scale with the intensity parameter.

#### Scenario: Float renders with default intensity
- **WHEN** `textEffect.type === 'float'` with intensity=50
- **THEN** the node displays a soft elevation shadow below the text

#### Scenario: Higher intensity increases shadow spread
- **WHEN** intensity increases from 50 to 100
- **THEN** the shadow blur and offset visibly increase

---

### Requirement: Vazado (hollow) effect
The Vazado effect SHALL apply `-webkit-text-stroke` to create an outlined text with a transparent fill.

#### Scenario: Vazado renders outlined text
- **WHEN** `textEffect.type === 'hollow'` with thickness=50
- **THEN** the text renders with a visible stroke and transparent interior

#### Scenario: Thickness adjusts stroke width
- **WHEN** thickness increases from 10 to 80
- **THEN** the stroke outline is visibly thicker

---

### Requirement: Fundo (background) effect
The Fundo effect SHALL apply a background color with configurable roundness (border-radius), extension (padding), and opacity to the text node's wrapper element.

#### Scenario: Fundo renders background behind text
- **WHEN** `textEffect.type === 'background'` with bgColor='#000000', bgOpacity=100, bgRoundness=0, bgExtension=50
- **THEN** the text node displays a solid background rectangle behind the text

#### Scenario: Roundness increases border-radius
- **WHEN** bgRoundness increases from 0 to 100
- **THEN** the background corners are progressively more rounded

#### Scenario: Transparent background
- **WHEN** bgOpacity is set to 0
- **THEN** the background is fully transparent (effectively invisible)

---

### Requirement: TextEffectsSidebar panel
The system SHALL display a `TextEffectsSidebar` left panel when the user activates the Efeitos action on a selected Title or Text node. The panel SHALL:
- Slide in from the left (consistent with FontSidebar and ColorSidebar)
- Display a grid of 5 effect thumbnails: Nenhum, Sombreado, Flutuante, Vazado, Fundo
- Highlight the currently active effect with a purple border
- Show contextual controls below the grid for the selected effect
- Close when the user clicks outside the panel

#### Scenario: Panel opens for text node
- **WHEN** a Title or Text node is selected and the user clicks the Efeitos button in the toolbar
- **THEN** the TextEffectsSidebar slides in from the left

#### Scenario: Panel not visible for non-text nodes
- **WHEN** a Container or Image node is selected
- **THEN** the Efeitos button is NOT shown in the contextual toolbar

#### Scenario: Selecting a new effect updates the node live
- **WHEN** user clicks a different effect thumbnail
- **THEN** the visual effect applies immediately to the selected node (live preview)

#### Scenario: Adjusting a slider updates the node live
- **WHEN** user moves a slider (e.g., Distância for Sombreado)
- **THEN** the effect on the canvas updates in real time

#### Scenario: Panel closes on outside click
- **WHEN** user clicks anywhere outside the TextEffectsSidebar
- **THEN** the panel closes and the current effect is preserved

---

### Requirement: Inline color picker inside TextEffectsSidebar
Effects that expose a color control (Sombreado, Fundo) SHALL display an inline color popover when the user clicks the color swatch. The popover SHALL show document colors, brand colors, and standard solid colors.

#### Scenario: Color popover opens on swatch click
- **WHEN** user clicks the color circle next to "Cor"
- **THEN** a popover appears with document colors, brand colors, and standard solid colors

#### Scenario: Selecting a color updates the effect live
- **WHEN** user clicks a color in the popover
- **THEN** the effect color updates and the popover closes

---

### Requirement: Efeitos button in ContextualToolbar
The contextual toolbar SHALL display an Efeitos button when a Title or Text node is selected. The button SHALL be positioned after the layout/position controls.

#### Scenario: Button visible for text nodes
- **WHEN** a Title or Text node is selected
- **THEN** the Efeitos button is visible in the contextual toolbar

#### Scenario: Button absent for non-text nodes
- **WHEN** a Container, Image, or Icon node is selected
- **THEN** the Efeitos button is NOT rendered
