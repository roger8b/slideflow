## ADDED Requirements

### Requirement: Font sidebar opens from contextual toolbar
The system SHALL replace the native `<select>` font control in `ContextualToolbar` with a clickable button that displays the current font name. Clicking this button SHALL open the `FontSidebar` panel sliding in from the right side of the editor.

#### Scenario: Open sidebar by clicking font button
- **WHEN** a text element (Title or Text) is selected and the user clicks the font name button in `ContextualToolbar`
- **THEN** the `FontSidebar` slides in from the right, the font button appears active, and the `ColorSidebar` (if open) is closed

#### Scenario: Only one sidebar open at a time
- **WHEN** the `ColorSidebar` is open and the user clicks the font button in `ContextualToolbar`
- **THEN** the `ColorSidebar` closes and the `FontSidebar` opens

#### Scenario: Close sidebar via X button
- **WHEN** the user clicks the X button in the `FontSidebar` header
- **THEN** the sidebar closes with a slide-out animation

#### Scenario: Close sidebar by clicking outside
- **WHEN** the `FontSidebar` is open and the user clicks anywhere on the editor canvas outside the sidebar
- **THEN** the sidebar closes

---

### Requirement: Font sidebar has two tabs
The `FontSidebar` SHALL display two tabs: **Fonte** (font family selection) and **Estilos de Texto** (text style presets). The active tab SHALL be visually distinguished. The sidebar SHALL open on the **Fonte** tab by default.

#### Scenario: Tabs are visible and switchable
- **WHEN** the `FontSidebar` is open
- **THEN** both "Fonte" and "Estilos de Texto" tabs are visible at the top and the user can switch between them by clicking

#### Scenario: Default tab on open
- **WHEN** the `FontSidebar` opens
- **THEN** the "Fonte" tab is active by default

---

### Requirement: Fonte tab shows fonts grouped by origin
The **Fonte** tab SHALL display fonts in three sections in order: **Fontes do documento**, **Kit de marca**, **Biblioteca**. Sections with no items SHALL be hidden. Each section SHALL show a heading and list font items.

#### Scenario: Document fonts shown when present
- **WHEN** the active slide has text elements using fonts
- **THEN** the "Fontes do documento" section is visible and lists those fonts (excluding brand kit token references)

#### Scenario: Document fonts hidden when none
- **WHEN** no text elements use non-brand-kit fonts in the active slide
- **THEN** the "Fontes do documento" section is hidden

#### Scenario: Brand kit section always visible
- **WHEN** the `FontSidebar` Fonte tab is open
- **THEN** the "Kit de marca" section is always visible showing the 4 brand font roles (title, header, subheader, body) with their role label and resolved font name

#### Scenario: Library section shows curated fonts
- **WHEN** the `FontSidebar` Fonte tab is open
- **THEN** the "Biblioteca" section shows the curated font list excluding fonts already listed in Kit de marca or Fontes do documento

---

### Requirement: Each font item renders a typographic preview
Every font item in the Fonte tab SHALL display the font name styled using its own `fontFamily` value, plus a muted "AaBbCc" preview string rendered in that font.

#### Scenario: Font name preview
- **WHEN** a font item is displayed in the list
- **THEN** the font name text is rendered using `fontFamily: <that font's value>` as an inline style

---

### Requirement: Active font is indicated with a checkmark
The font currently applied to the selected element SHALL be visually marked with a ✓ icon in the list.

#### Scenario: Checkmark on current font
- **WHEN** the selected element's `fontFamily` matches a font option in the list
- **THEN** that item displays a ✓ icon and no other item does

#### Scenario: No checkmark when font not in list
- **WHEN** the selected element's `fontFamily` does not match any listed font
- **THEN** no checkmark is shown

---

### Requirement: Selecting a font applies it to the selected element
Clicking a font item SHALL immediately apply it to the selected element via `setProp('fontFamily', value)`.

#### Scenario: Apply font from Kit de marca
- **WHEN** the user clicks a font in the "Kit de marca" section
- **THEN** `fontFamily` is set to `var(--brand-font-<role>)` for that role and the element updates visually

#### Scenario: Apply font from Biblioteca or Documento
- **WHEN** the user clicks a font from the "Biblioteca" or "Fontes do documento" section
- **THEN** `fontFamily` is set to the font's string value (e.g., `'Inter', sans-serif`) and the element updates visually

---

### Requirement: Real-time search filters all font sections
A search input at the top of the Fonte tab SHALL filter font items across all sections simultaneously. Filtering is case-insensitive and matches against the display name of the font. Sections with no matching items SHALL be hidden during active search.

#### Scenario: Search narrows results
- **WHEN** the user types "inter" in the search input
- **THEN** only font items whose names contain "inter" (case-insensitive) are shown across all sections

#### Scenario: Empty search restores all groups
- **WHEN** the user clears the search input
- **THEN** all sections and fonts are restored to their default state

#### Scenario: No results state
- **WHEN** the search query matches no fonts
- **THEN** a "Nenhuma fonte encontrada" empty state message is displayed
