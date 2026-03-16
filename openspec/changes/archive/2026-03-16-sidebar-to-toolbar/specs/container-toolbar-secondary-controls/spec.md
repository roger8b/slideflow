## ADDED Requirements

### Requirement: SettingsPanel shows only advanced controls for Container
The SettingsPanel for a Container element SHALL display only the following controls:
- **Height Fixed input**: a numeric px input, shown only when `height` is a fixed px value (FIX mode)
- **Style Presets**: quick-apply buttons for Surface and Glass visual styles
- **Save as Block**: button to save the Container as a reusable block

The SettingsPanel SHALL NOT display controls for: padding, gap, flex direction, align items, justify content, display mode (flex/grid), grid columns, box shadow, backdrop blur, background image, or background opacity. These are managed exclusively via the ContextualToolbar.

#### Scenario: Duplicated layout controls absent from sidebar
- **WHEN** a Container is selected and the SettingsPanel is open
- **THEN** no padding, gap, flex direction, alignment, grid, shadow, blur, or background image controls are shown in the panel

#### Scenario: Height Fixed input shown in sidebar when FIX mode active
- **WHEN** a Container's `height` prop is a fixed px value (FIX mode)
- **THEN** the SettingsPanel shows a height px input for fine-tuned editing

#### Scenario: Height input hidden when not in FIX mode
- **WHEN** a Container's `height` is `'auto'` or `'100%'`
- **THEN** no height input is shown in the SettingsPanel

#### Scenario: Style Presets remain in sidebar
- **WHEN** a Container is selected and SettingsPanel is open
- **THEN** Surface and Glass preset buttons are visible and functional

#### Scenario: Save as Block remains in sidebar
- **WHEN** a Container is selected and SettingsPanel is open
- **THEN** the Save as Block button is visible and functional
