## MODIFIED Requirements

### Requirement: Font sidebar opens from the left side
The `FontSidebar` SHALL appear on the left side of the editor, consistent with the `ColorSidebar` positioning pattern.

#### Scenario: Sidebar slides in from the left
- **WHEN** the user opens the `FontSidebar`
- **THEN** the panel slides in from the left edge of the editor (not the right)

#### Scenario: Sidebar has right border
- **WHEN** the `FontSidebar` is open
- **THEN** it has a right border (`border-r`) separating it from the canvas area
