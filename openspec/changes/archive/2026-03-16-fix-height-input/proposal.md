## Why

The FIX height numeric input in the Container toolbar is broken. When a user selects "FIX" mode and tries to change the height value, the input immediately snaps back to 100 whenever the field is cleared (even momentarily while typing a new number). The root cause is `parseInt(e.target.value) || 100` — when the field is empty, `parseInt("") = NaN`, and `NaN || 100 = 100`, resetting the value instantly. The same issue prevents entering `0` (falsy). The input is also fully controlled by Craft.js state with no local buffer, meaning every keypress round-trips through the editor state and fights the user's typing.

## What Changes

- **Extract** the FIX height px input from the inline IIFE in `ContextualToolbar.tsx` into a dedicated `NumericInput` sub-component that maintains a local buffered state
- The `NumericInput` component SHALL sync from the external value when the external source changes, but NOT on every prop update during user typing
- The `NumericInput` component SHALL commit to `setProp` only on `blur` or `Enter` keypress
- The `NumericInput` component SHALL be reusable for other numeric toolbar inputs (e.g., PAD, GAP, RAD, BORD, SZ, STK) — these all share the same round-trip problem

## Capabilities

### New Capabilities
- `buffered-numeric-input`: A `NumericInput` React component for toolbar numeric inputs that buffers locally and commits on blur/Enter, preventing the reset-on-empty antipattern

### Modified Capabilities
*(none — no existing spec-level behavior changes; this is a bug fix)*

## Impact

- `src/components/editor/ContextualToolbar.tsx` — replace the FIX height raw `<input>` with `<NumericInput>`, and optionally replace other numeric inputs (PAD, GAP) for consistency
- New sub-component can live inline in `ContextualToolbar.tsx` or in a shared utility file
