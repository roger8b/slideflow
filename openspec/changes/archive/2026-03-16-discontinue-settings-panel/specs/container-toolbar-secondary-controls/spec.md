## MODIFIED Requirements

### Requirement: SettingsPanel shows only advanced controls for Container
The SettingsPanel for a Container element SHALL display only the following controls:
- **Height Fixed input**: a numeric px input, shown only when `height` is a fixed px value (FIX mode)
- **Style Presets**: quick-apply buttons for Surface and Glass visual styles — **REMOVED, moved to overflow panel**
- **Save as Block**: button to save the Container as a reusable block — **REMOVED, moved to overflow panel**

The SettingsPanel SHALL NOT display controls for: padding, gap, flex direction, align items, justify content, display mode (flex/grid), grid columns, box shadow, backdrop blur, background image, background opacity, border radius, border width, or border color. These are managed exclusively via the ContextualToolbar and its overflow panel.

After full migration, the SettingsPanel SHALL be removed from the editor layout entirely.

#### Scenario: Duplicated layout controls absent from sidebar
- **WHEN** a Container is selected and the SettingsPanel is open
- **THEN** no padding, gap, flex direction, alignment, grid, shadow, blur, background image, or border controls are shown in the panel

#### Scenario: Height Fixed input shown in sidebar when FIX mode active
- **WHEN** a Container's `height` prop is a fixed px value (FIX mode)
- **THEN** the SettingsPanel shows a height px input for fine-tuned editing

#### Scenario: Height input hidden when not in FIX mode
- **WHEN** a Container's `height` is `'auto'` or `'100%'`
- **THEN** no height input is shown in the SettingsPanel

#### Scenario: Style Presets no longer in sidebar
- **WHEN** a Container is selected and the SettingsPanel is open
- **THEN** no Surface or Glass preset buttons are visible in the sidebar (they are in the overflow panel)

#### Scenario: Save as Block no longer in sidebar
- **WHEN** a Container is selected and the SettingsPanel is open
- **THEN** no Save as Block button is visible in the sidebar (it is in the overflow panel)

---

## REMOVED Requirements

### Requirement: Toolbar shows border color picker for Container
**Reason**: Border color moved to the `⚙️` overflow panel to reduce primary toolbar density.
**Migration**: Use the `⚙️` overflow panel to access the border color picker.

### Requirement: Toolbar shows box shadow cycle button for Container
**Reason**: Box shadow moved to the `⚙️` overflow panel to reduce primary toolbar density.
**Migration**: Use the `⚙️` overflow panel to cycle shadow presets.

### Requirement: Toolbar shows display mode toggle (Flex / Grid) for Container
**Reason**: Flex/Grid toggle moved to the `⚙️` overflow panel to reduce primary toolbar density.
**Migration**: Use the `⚙️` overflow panel to switch display mode.

### Requirement: Grid column count stepper is shown when display is grid
**Reason**: Grid column stepper moved to the `⚙️` overflow panel alongside the display toggle.
**Migration**: Use the `⚙️` overflow panel to adjust column count.

### Requirement: Toolbar has an effects popover for secondary container controls
**Reason**: Replaced by the unified `⚙️` overflow panel which includes all effects controls plus border, shadow, layout mode, presets, and save-as-block.
**Migration**: Use the `⚙️` overflow panel to access blur, background image, and opacity controls.
