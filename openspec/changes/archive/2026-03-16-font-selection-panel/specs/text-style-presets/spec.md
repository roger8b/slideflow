## ADDED Requirements

### Requirement: Text style presets tab shows brand kit styles
The **Estilos de Texto** tab SHALL display a "Kit de marca" section with predefined composite text styles derived from the active brand kit. Each style item SHALL show a visual preview of the style (rendered at its intended font, size and weight) and a label (Título, Subtítulo, Corpo).

#### Scenario: Brand kit styles are listed
- **WHEN** the user opens the "Estilos de Texto" tab
- **THEN** the "Kit de marca" section shows at minimum: Título, Subtítulo, and Corpo style items

#### Scenario: Style preview is visually rendered
- **WHEN** a style item is displayed
- **THEN** its label ("Título", "Subtítulo", "Corpo") is rendered using the corresponding brand font, font-size, and font-weight values

---

### Requirement: Applying a brand kit style sets multiple typographic props at once
Clicking a style item in the "Kit de marca" section SHALL apply `fontFamily`, `fontSize`, and `fontWeight` to the selected element in a single operation. The values SHALL come from the brand kit role definitions.

The default values per role are:

| Role      | fontFamily token         | fontSize | fontWeight |
|-----------|--------------------------|----------|------------|
| title     | var(--brand-font-title)  | 40       | 700        |
| header    | var(--brand-font-header) | 28       | 700        |
| subheader | var(--brand-font-subheader) | 20    | 600        |
| body      | var(--brand-font-body)   | 16       | 400        |

#### Scenario: Apply Título preset
- **WHEN** the user clicks the "Título" style item
- **THEN** the selected element's `fontFamily` is set to `var(--brand-font-title)`, `fontSize` to `40`, and `fontWeight` to `700`

#### Scenario: Apply Corpo preset
- **WHEN** the user clicks the "Corpo" style item
- **THEN** the selected element's `fontFamily` is set to `var(--brand-font-body)`, `fontSize` to `16`, and `fontWeight` to `400`

---

### Requirement: Document styles section shows styles detected from active slide
The **Estilos de Texto** tab SHALL display an "Estilos do documento" section listing up to 5 distinct typographic styles found in the text nodes of the currently active slide. Styles are grouped by the combination of `fontFamily + fontSize + fontWeight`. They are sorted by font size descending and labeled "Título", "Subtítulo", "Corpo" for the top 3 (or by size rank for additional styles).

#### Scenario: Document styles derived from slide nodes
- **WHEN** the active slide has text elements with distinct font configurations
- **THEN** the "Estilos do documento" section lists those styles with visual preview

#### Scenario: Document styles empty state
- **WHEN** the active slide has no text elements
- **THEN** the "Estilos do documento" section is hidden

#### Scenario: Duplicate styles deduplicated
- **WHEN** multiple text elements share the same fontFamily + fontSize + fontWeight
- **THEN** that combination appears only once in the document styles list

---

### Requirement: Active style is indicated with a checkmark
If the selected element's current `fontFamily`, `fontSize`, and `fontWeight` exactly match a preset in either section, that preset SHALL display a ✓ icon.

#### Scenario: Checkmark on matching preset
- **WHEN** the selected element's typographic props exactly match a brand kit preset
- **THEN** that preset item displays a ✓ icon

#### Scenario: No checkmark for partial match
- **WHEN** only `fontFamily` matches a preset but `fontSize` or `fontWeight` differs
- **THEN** no checkmark is shown for that preset

---

### Requirement: Applying a document style sets multiple typographic props at once
Clicking a style item in the "Estilos do documento" section SHALL apply its `fontFamily`, `fontSize`, and `fontWeight` to the selected element in a single operation.

#### Scenario: Apply document style
- **WHEN** the user clicks a style item from "Estilos do documento"
- **THEN** the selected element's `fontFamily`, `fontSize`, and `fontWeight` are updated to match the clicked style
