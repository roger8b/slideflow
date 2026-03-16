## ADDED Requirements

### Requirement: Container toolbar has a settings overflow panel
When a Container element is selected, the contextual toolbar SHALL display a `⚙️` (Settings) button that opens a compact floating overflow panel anchored below the button. The panel SHALL contain all secondary container controls grouped logically. The panel SHALL close when the user clicks outside of it.

#### Scenario: Settings button is visible for Container
- **WHEN** a Container element is selected
- **THEN** a `⚙️` settings button is visible in the toolbar to the right of the height mode toggle

#### Scenario: Clicking settings button opens the overflow panel
- **WHEN** the user clicks the `⚙️` button
- **THEN** a floating panel appears below the button containing secondary controls

#### Scenario: Panel closes on outside click
- **WHEN** the overflow panel is open and the user clicks outside it
- **THEN** the panel closes

#### Scenario: Panel closes on node selection change
- **WHEN** the selected node changes while the overflow panel is open
- **THEN** the panel closes automatically

---

### Requirement: Overflow panel contains border controls
The overflow panel for a Container element SHALL contain compact numeric inputs for `borderRadius` (RAD) and `borderWidth` (BORD), and a color swatch button that opens the `ColorSidebar` targeting the `borderColor` prop.

#### Scenario: RAD and BORD inputs present in panel
- **WHEN** the overflow panel is open
- **THEN** RAD and BORD numeric inputs are visible and reflect current prop values

#### Scenario: Changing RAD updates borderRadius
- **WHEN** the user changes the RAD input in the overflow panel
- **THEN** the Container's `borderRadius` prop is updated

#### Scenario: Changing BORD updates borderWidth
- **WHEN** the user changes the BORD input in the overflow panel
- **THEN** the Container's `borderWidth` prop is updated

#### Scenario: Border color swatch opens ColorSidebar
- **WHEN** the user clicks the border color swatch in the overflow panel
- **THEN** the `ColorSidebar` opens targeting the `borderColor` prop

---

### Requirement: Overflow panel contains shadow cycle button
The overflow panel for a Container element SHALL contain a shadow cycle button (SHD) that cycles through None → Soft → Strong → None.

#### Scenario: Shadow cycle button present in panel
- **WHEN** the overflow panel is open
- **THEN** a shadow cycle button is visible showing the current shadow state

#### Scenario: Clicking shadow button cycles presets
- **WHEN** the user clicks the SHD button in the overflow panel
- **THEN** `boxShadow` advances to the next preset in the cycle

---

### Requirement: Overflow panel contains display mode toggle and grid column stepper
The overflow panel for a Container element SHALL contain the Flex/Grid display mode toggle and the grid column stepper (−/N/+), which appears only when `display` is `'grid'`.

#### Scenario: Flex/Grid toggle visible in panel
- **WHEN** the overflow panel is open
- **THEN** Flex and Grid buttons are visible

#### Scenario: Grid column stepper visible only in grid mode
- **WHEN** the overflow panel is open and Container has `display: 'grid'`
- **THEN** a column count stepper (−/N/+) is visible next to the display toggle

#### Scenario: Grid column stepper hidden in flex mode
- **WHEN** the overflow panel is open and Container has `display: 'flex'` or no display set
- **THEN** no column count stepper is shown

---

### Requirement: Overflow panel contains effects controls
The overflow panel for a Container element SHALL contain the three effects controls previously in the FX popover: `backdropBlur` slider (0–40 px), `backgroundImage` URL input, and `backgroundOpacity` slider (0–100 %).

#### Scenario: Effects controls present in panel
- **WHEN** the overflow panel is open
- **THEN** blur slider, background image URL input, and opacity slider are visible

#### Scenario: Adjusting blur updates prop
- **WHEN** the user adjusts the blur slider in the overflow panel
- **THEN** the Container's `backdropBlur` prop is updated in real time

#### Scenario: Typing background image URL updates prop
- **WHEN** the user types a URL in the background image input in the overflow panel
- **THEN** the Container's `backgroundImage` prop is updated

#### Scenario: Adjusting opacity updates prop
- **WHEN** the user adjusts the opacity slider in the overflow panel
- **THEN** the Container's `backgroundOpacity` prop is updated in real time

---

### Requirement: Overflow panel contains style presets
The overflow panel for a Container element SHALL contain a Presets section with Surface and Glass quick-apply buttons.

#### Scenario: Surface preset applies styles
- **WHEN** the user clicks the Surface preset button in the overflow panel
- **THEN** `borderRadius`, `borderWidth`, `background`, and `boxShadow` are set to the Surface preset values

#### Scenario: Glass preset applies styles
- **WHEN** the user clicks the Glass preset button in the overflow panel
- **THEN** `borderRadius`, `background`, `borderWidth`, `borderColor`, and `backdropBlur` are set to the Glass preset values

---

### Requirement: Overflow panel contains Save as Block action
The overflow panel for a Container element SHALL contain a "Save as Block" button that, when clicked, opens an inline name input and Save button within the panel to save the container as a reusable block.

#### Scenario: Save as Block button visible in panel
- **WHEN** the overflow panel is open
- **THEN** a "Save as Block" button is visible at the bottom of the panel

#### Scenario: Clicking Save as Block shows name input
- **WHEN** the user clicks the "Save as Block" button
- **THEN** an inline name input and Save button appear within the panel

#### Scenario: Saving block stores the reusable block
- **WHEN** the user enters a name and clicks Save
- **THEN** the current Container tree is saved as a reusable block and the input is dismissed
