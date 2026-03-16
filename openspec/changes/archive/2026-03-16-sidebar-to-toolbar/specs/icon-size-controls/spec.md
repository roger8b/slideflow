## ADDED Requirements

### Requirement: Toolbar shows Size input for Icon
When an Icon element is selected, the contextual toolbar SHALL display a compact labeled numeric input (`SZ`) for the `size` prop. The input SHALL reflect the current value and update the prop on change.

#### Scenario: Size input is visible when Icon is selected
- **WHEN** an Icon element is selected
- **THEN** a `SZ` labeled numeric input is visible in the toolbar

#### Scenario: Size input reflects current value
- **WHEN** an Icon is selected and its `size` prop is set
- **THEN** the `SZ` input displays the current `size` value

#### Scenario: Changing size input updates prop
- **WHEN** the user changes the value in the `SZ` input
- **THEN** the Icon's `size` prop is updated to the new numeric value

---

### Requirement: Toolbar shows Stroke Width input for Icon
When an Icon element is selected, the contextual toolbar SHALL display a compact labeled numeric input (`STK`) for the `strokeWidth` prop. The input SHALL reflect the current value and update the prop on change.

#### Scenario: Stroke Width input is visible when Icon is selected
- **WHEN** an Icon element is selected
- **THEN** a `STK` labeled numeric input is visible in the toolbar

#### Scenario: Stroke Width input reflects current value
- **WHEN** an Icon is selected and its `strokeWidth` prop is set
- **THEN** the `STK` input displays the current `strokeWidth` value

#### Scenario: Changing stroke width input updates prop
- **WHEN** the user changes the value in the `STK` input
- **THEN** the Icon's `strokeWidth` prop is updated to the new numeric value
