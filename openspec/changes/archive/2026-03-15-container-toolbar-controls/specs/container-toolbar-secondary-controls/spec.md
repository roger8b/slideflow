## ADDED Requirements

### Requirement: Toolbar shows border color picker for Container
When a Container element is selected, the contextual toolbar SHALL display a `borderColor` swatch button that opens the `ColorSidebar` targeting the `borderColor` prop. The swatch SHALL reflect the current `borderColor` value. The button SHALL be visually grouped with the `borderWidth` input.

#### Scenario: Border color button visible
- **WHEN** a Container element is selected
- **THEN** a color swatch button for `borderColor` is visible in the toolbar next to the border width control

#### Scenario: Clicking border color opens ColorSidebar
- **WHEN** the user clicks the `borderColor` swatch in the toolbar
- **THEN** the `ColorSidebar` opens targeting the `borderColor` prop and the swatch displays the current color

#### Scenario: Changing color updates element
- **WHEN** the user selects a new color in the ColorSidebar (opened via borderColor swatch)
- **THEN** the Container's `borderColor` prop is updated immediately

---

### Requirement: Toolbar shows box shadow cycle button for Container
When a Container element is selected, the contextual toolbar SHALL display a shadow toggle button that cycles through three presets: None → Soft → Strong → None.

The preset values SHALL be:
- **None**: `'none'`
- **Soft**: `'0 4px 12px rgba(0,0,0,0.12)'`
- **Strong**: `'0 10px 30px rgba(0,0,0,0.25)'`

#### Scenario: Shadow button cycles presets
- **WHEN** the user clicks the shadow button repeatedly
- **THEN** `boxShadow` cycles through None → Soft → Strong → None in sequence

#### Scenario: Shadow button reflects current state
- **WHEN** a Container is selected and its `boxShadow` matches one of the presets
- **THEN** the shadow button's icon or label reflects the active preset (e.g., filled vs outline icon)

---

### Requirement: Toolbar shows display mode toggle (Flex / Grid) for Container
When a Container element is selected, the contextual toolbar SHALL display a Flex/Grid toggle — two icon buttons side-by-side. The active mode SHALL be visually highlighted. Switching to Grid SHALL default `gridTemplateColumns` to `'repeat(2, 1fr)'` if not already set.

#### Scenario: Flex mode active by default
- **WHEN** a Container is selected and `display` is `'flex'` or unset
- **THEN** the Flex button is highlighted and the Grid button is not

#### Scenario: Switching to Grid mode
- **WHEN** the user clicks the Grid button
- **THEN** `display` is set to `'grid'` and `gridTemplateColumns` defaults to `'repeat(2, 1fr)'` if previously unset

#### Scenario: Switching to Flex mode
- **WHEN** the user clicks the Flex button while in Grid mode
- **THEN** `display` is set to `'flex'`

---

### Requirement: Grid column count stepper is shown when display is grid
When a Container's `display` is `'grid'`, the contextual toolbar SHALL display a column count stepper (−/N/+) showing the current column count derived from `gridTemplateColumns`. The stepper SHALL allow values from 1 to 6 and update `gridTemplateColumns` to `repeat(N, 1fr)`. The stepper SHALL be hidden when `display` is `'flex'`.

#### Scenario: Stepper visible in grid mode
- **WHEN** a Container has `display: 'grid'`
- **THEN** a column count stepper (−/N/+) is visible in the toolbar next to the display toggle

#### Scenario: Stepper hidden in flex mode
- **WHEN** a Container has `display: 'flex'`
- **THEN** no column count stepper is shown

#### Scenario: Incrementing columns
- **WHEN** the user clicks + on the stepper and current count is less than 6
- **THEN** `gridTemplateColumns` is set to `repeat(N+1, 1fr)`

#### Scenario: Decrementing columns
- **WHEN** the user clicks − on the stepper and current count is greater than 1
- **THEN** `gridTemplateColumns` is set to `repeat(N-1, 1fr)`

---

### Requirement: Toolbar has an effects popover for secondary container controls
When a Container element is selected, the contextual toolbar SHALL display a "More" (⋯ or FX) button that opens a compact popover containing:
- `backdropBlur` slider (0–40 px)
- `backgroundImage` URL input
- `backgroundOpacity` slider (0–100 %)

The popover SHALL close when clicking outside of it.

#### Scenario: Effects popover opens
- **WHEN** the user clicks the ⋯ / FX button in the Container toolbar
- **THEN** a compact popover appears below (or above) the button with the three effect controls

#### Scenario: backdropBlur slider updates prop
- **WHEN** the user adjusts the backdropBlur slider in the popover
- **THEN** the Container's `backdropBlur` prop is updated in real time

#### Scenario: backgroundImage URL input updates prop
- **WHEN** the user types or pastes a URL into the backgroundImage input in the popover
- **THEN** the Container's `backgroundImage` prop is updated

#### Scenario: backgroundOpacity slider updates prop
- **WHEN** the user adjusts the backgroundOpacity slider in the popover
- **THEN** the Container's `backgroundOpacity` prop is updated in real time

#### Scenario: Popover closes on outside click
- **WHEN** the effects popover is open and the user clicks anywhere outside it
- **THEN** the popover closes
