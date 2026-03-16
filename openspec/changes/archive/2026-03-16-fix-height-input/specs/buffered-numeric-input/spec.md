## ADDED Requirements

### Requirement: NumericInput buffers typed value locally and commits on blur or Enter
A `NumericInput` component SHALL maintain a local string state for the displayed value, allowing the user to freely type any intermediate value (including empty string) without updating the external state. The component SHALL commit the final numeric value to the external `onChange` callback only when the user blurs the input or presses Enter.

#### Scenario: Typing a new number does not reset the input
- **WHEN** the user clears the FIX height input and begins typing a new number
- **THEN** the intermediate empty state does NOT snap back to the fallback value; the field stays empty while the user is typing

#### Scenario: Committing on blur writes the final value
- **WHEN** the user finishes typing and clicks elsewhere (blur)
- **THEN** the typed numeric value is committed to Craft.js via `onChange` and the Container's `height` prop is updated

#### Scenario: Committing on Enter writes the final value
- **WHEN** the user types a value and presses Enter
- **THEN** the typed numeric value is committed to Craft.js via `onChange`

#### Scenario: Clearing the field and blurring falls back to the minimum or last valid value
- **WHEN** the user clears the input entirely and blurs without typing anything
- **THEN** the field reverts to the previous valid value (no prop update occurs with an invalid value)

#### Scenario: External value change does not override an actively-focused input
- **WHEN** the input is focused and the external value changes (e.g., via undo)
- **THEN** the displayed value is NOT overwritten; the user's in-progress editing is preserved

#### Scenario: External value change updates display when input is not focused
- **WHEN** the external value changes and the input is not focused
- **THEN** the displayed value updates to reflect the new external value

---

### Requirement: FIX height input uses NumericInput
The FIX height px input in the Container toolbar's height mode section SHALL use the `NumericInput` component, replacing the previous raw `<input>` with `onChange` calling `setProp` directly.

#### Scenario: FIX height input accepts a new value
- **WHEN** a Container is in FIX height mode and the user types a new number in the input and blurs
- **THEN** the Container's `height` prop is updated to `${value}px` with the typed number

#### Scenario: FIX height input does not snap during typing
- **WHEN** the user is actively typing in the FIX height input
- **THEN** the Craft.js `height` prop is NOT updated on every keystroke; it is only updated on commit

---

### Requirement: PAD and GAP inputs use NumericInput
The PAD and GAP inputs in the Container toolbar primary strip SHALL use the `NumericInput` component.

#### Scenario: PAD input accepts a new value without snapping
- **WHEN** the user types a new padding value in the PAD input and blurs
- **THEN** the Container's `padding` prop is updated to the typed number

#### Scenario: GAP input accepts a new value without snapping
- **WHEN** the user types a new gap value in the GAP input and blurs
- **THEN** the Container's `gap` prop is updated to the typed number
