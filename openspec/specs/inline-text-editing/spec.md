# inline-text-editing Specification

## Purpose
TBD - created by archiving change discontinue-settings-panel. Update Purpose after archive.
## Requirements
### Requirement: Text and Title elements support inline editing via double-click
When a `Text` or `Title` element is selected, double-clicking on it SHALL activate inline editing mode, allowing the user to modify the text content directly on the canvas. On blur or pressing Escape/Enter, the new content SHALL be saved to the `text` prop and inline editing mode SHALL exit.

#### Scenario: Double-click activates inline editing
- **WHEN** a Text or Title element is selected and the user double-clicks it
- **THEN** the element enters inline editing mode (the element content becomes editable)

#### Scenario: Edited content is saved on blur
- **WHEN** the user has edited text inline and clicks elsewhere on the canvas
- **THEN** the new text content is saved to the `text` prop

#### Scenario: Escape key exits editing without saving
- **WHEN** the user is in inline editing mode and presses Escape
- **THEN** inline editing mode exits and the original text content is restored

#### Scenario: Inline editing does not activate on single click
- **WHEN** the user single-clicks a Text or Title element
- **THEN** only selection occurs; inline editing mode is NOT activated

#### Scenario: SettingsPanel text textarea is removed
- **WHEN** a Text element is selected
- **THEN** no Text Content textarea is shown in the SettingsPanel

