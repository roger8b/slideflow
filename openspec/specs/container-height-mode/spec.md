# container-height-mode Specification

## Purpose
TBD - created by archiving change sidebar-to-toolbar. Update Purpose after archive.
## Requirements
### Requirement: Toolbar shows Height Mode toggle for Container
When a Container element is selected, the contextual toolbar SHALL display a compact 3-way Height Mode toggle with labels `HUG`, `FILL`, and `FIX`. The active mode SHALL be visually highlighted.

Prop mapping:
- **HUG** → `height: 'auto'` (or absent/undefined)
- **FILL** → `height: '100%'`
- **FIX** → `height: '<N>px'` (any string ending in `px`)

#### Scenario: HUG mode active when height is auto or unset
- **WHEN** a Container is selected and its `height` prop is `'auto'`, `undefined`, or absent
- **THEN** the `HUG` button is highlighted and the other two are not

#### Scenario: FILL mode active when height is 100%
- **WHEN** a Container is selected and its `height` prop is `'100%'`
- **THEN** the `FILL` button is highlighted

#### Scenario: FIX mode active when height is a px value
- **WHEN** a Container is selected and its `height` prop is a string ending in `px` (e.g., `'200px'`)
- **THEN** the `FIX` button is highlighted

#### Scenario: Clicking HUG sets height to auto
- **WHEN** the user clicks `HUG` in the Height Mode toggle
- **THEN** the Container's `height` prop is set to `'auto'`

#### Scenario: Clicking FILL sets height to 100%
- **WHEN** the user clicks `FILL` in the Height Mode toggle
- **THEN** the Container's `height` prop is set to `'100%'`

#### Scenario: Clicking FIX sets height to a fixed px value
- **WHEN** the user clicks `FIX` in the Height Mode toggle
- **THEN** the Container's `height` prop is set to `'100px'` (default) if not already a px value, and the px input appears

---

### Requirement: Fixed height px input is shown when FIX mode is active
When a Container's Height Mode is `FIX`, the toolbar SHALL display a numeric input showing the current pixel value. Changing the input SHALL update the `height` prop to `'<N>px'`.

#### Scenario: px input visible in FIX mode
- **WHEN** a Container is in FIX height mode
- **THEN** a numeric input displaying the current pixel value is visible next to the HUG/FILL/FIX toggle

#### Scenario: px input hidden in HUG and FILL modes
- **WHEN** a Container is in HUG or FILL height mode
- **THEN** no height px input is shown in the toolbar

#### Scenario: Changing px input updates height prop
- **WHEN** the user changes the value in the height px input
- **THEN** the Container's `height` prop is updated to `'<newValue>px'`

