### Requirement: Font items with variants show an expand chevron
Font items in the `FontSidebar` that have defined variants SHALL display a `>` chevron button to the left of the font name. Font items without variants SHALL NOT display a chevron.

#### Scenario: Chevron visible for fonts with variants
- **WHEN** a font item has one or more variants defined
- **THEN** a `>` chevron icon is displayed to the left of the font name row

#### Scenario: No chevron for fonts without variants
- **WHEN** a font item has no variants defined
- **THEN** no chevron is displayed and the row behaves identically to the current implementation

---

### Requirement: Clicking the chevron expands the font to show its variants
Clicking the `>` chevron SHALL expand the font row inline, revealing sub-items for each available variant (e.g., "Regular", "Negrito", "Itálico"). Only one font SHALL be expanded at a time — opening a new font SHALL collapse the previously expanded one.

#### Scenario: Expand on chevron click
- **WHEN** the user clicks the `>` chevron of a collapsed font row
- **THEN** the row expands to show its variant sub-items below the font name

#### Scenario: Collapse on second click
- **WHEN** the user clicks the `>` chevron of an already expanded font row
- **THEN** the variant sub-items are hidden and the row returns to its collapsed state

#### Scenario: Only one font expanded at a time
- **WHEN** font A is expanded and the user clicks the chevron of font B
- **THEN** font A collapses and font B expands

---

### Requirement: Each variant sub-item displays a typographic preview
Each variant sub-item SHALL display:
- A human-readable label (e.g., "Regular", "Negrito", "Itálico", "Negrito Itálico")
- A preview string "AaBbCc" rendered using the variant's `fontFamily`, `fontWeight`, and `fontStyle`

#### Scenario: Variant preview renders in correct style
- **WHEN** a variant sub-item is visible
- **THEN** its preview text "AaBbCc" is rendered with `fontFamily`, `fontWeight`, and `fontStyle` matching that variant's values

---

### Requirement: Selecting a variant applies fontFamily, fontWeight, and fontStyle simultaneously
Clicking a variant sub-item SHALL apply all three typographic properties (`fontFamily`, `fontWeight`, `fontStyle`) to the selected element in a single operation.

#### Scenario: Apply Regular variant
- **WHEN** the user clicks the "Regular" variant of a font
- **THEN** `fontFamily` is set to that font's value, `fontWeight` to `400`, and `fontStyle` to `'normal'`

#### Scenario: Apply Negrito (Bold) variant
- **WHEN** the user clicks the "Negrito" variant of a font
- **THEN** `fontFamily` is set to that font's value, `fontWeight` to `700`, and `fontStyle` to `'normal'`

#### Scenario: Apply Itálico variant
- **WHEN** the user clicks the "Itálico" variant of a font
- **THEN** `fontFamily` is set to that font's value, `fontWeight` to `400`, and `fontStyle` to `'italic'`

---

### Requirement: The active variant is indicated with a checkmark
If the selected element's `fontFamily`, `fontWeight`, AND `fontStyle` all match a variant sub-item, that sub-item SHALL display a ✓ icon.

#### Scenario: Checkmark on exact match
- **WHEN** the selected element's fontFamily, fontWeight, and fontStyle exactly match a variant sub-item
- **THEN** that variant sub-item displays a ✓ icon and the parent font row also shows the ✓ at the name level

#### Scenario: No checkmark for partial match
- **WHEN** only fontFamily matches but fontWeight or fontStyle differs
- **THEN** no checkmark is shown on any variant sub-item

---

### Requirement: Clicking the font name row applies only fontFamily (unchanged behavior)
Clicking the font name itself (not the chevron, not a variant) SHALL continue to apply only `fontFamily` to the selected element, preserving the existing behavior.

#### Scenario: Font name click applies fontFamily only
- **WHEN** the user clicks the font name text of a row that has variants
- **THEN** only `fontFamily` is updated; `fontWeight` and `fontStyle` are not changed
