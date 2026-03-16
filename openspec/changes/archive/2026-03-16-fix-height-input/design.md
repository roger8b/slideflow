## Context

The Container toolbar FIX height input is a controlled React input whose value is derived directly from Craft.js node props on every render. When the user types, `onChange` calls `setProp` immediately, which triggers a Craft.js state update and re-render. The value displayed is always `parseInt(props.height)`. This architecture breaks because:

1. `parseInt("") || 100 = 100` — any empty intermediate state snaps back to 100
2. `parseInt("0") || 100 = 100` — typing 0 also snaps to 100 (0 is falsy)
3. Round-trip through Craft.js on every keypress is unnecessary and causes jank

All other numeric inputs in the toolbar (PAD, GAP, in the overflow panel: RAD, BORD, SZ, STK) have the same structural issue but are less noticeable because their values don't have the `|| fallback` guard as aggressively.

## Goals / Non-Goals

**Goals:**
- Fix the FIX height input so users can freely type a new number without it resetting
- Extract a reusable `NumericInput` component that handles the buffered pattern correctly
- Replace the FIX height input with `NumericInput`
- Replace PAD and GAP primary-strip inputs with `NumericInput` for consistency

**Non-Goals:**
- Replacing ALL numeric inputs in the overflow panel (RAD, BORD, SZ, STK) — this can follow but is out of scope
- Changing the height mode logic itself
- Changing any other behavior of the toolbar

## Decisions

### Decision 1: Local state buffer with sync from external value

**Chosen:** `NumericInput` maintains `[localValue, setLocalValue]` state. It syncs from the external `value` prop via `useEffect` keyed on `value` — but only when the input is NOT focused. On `blur` or `Enter`, it commits the local value to the external `onChange`.

```typescript
const NumericInput = ({ value, onChange, min, className, suffix }: NumericInputProps) => {
    const [local, setLocal] = useState(String(value));
    const isFocused = useRef(false);

    // Sync from external only when not focused
    useEffect(() => {
        if (!isFocused.current) setLocal(String(value));
    }, [value]);

    const commit = () => {
        const v = parseInt(local);
        const clamped = isNaN(v) ? value : (min !== undefined ? Math.max(min, v) : v);
        onChange(clamped);
        setLocal(String(clamped)); // normalize display
    };

    return (
        <input
            type="number"
            value={local}
            onFocus={() => { isFocused.current = true; }}
            onBlur={() => { isFocused.current = false; commit(); }}
            onChange={(e) => setLocal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
            className={className}
        />
    );
};
```

**Why:** This is the standard pattern for design-tool numeric inputs (Figma, Sketch, Framer all use this). Local state allows free typing; the external Craft.js state is only updated when the user finishes. The `isFocused` ref prevents the external value from overwriting what the user is currently typing if Craft.js re-renders mid-edit (e.g., due to another component updating).

**Alternative considered:** `onKeyDown` commit-on-each-valid-digit (Option C from explore) — rejected because it doesn't allow clearing the field, and requires careful handling of `NaN` fallbacks throughout.

### Decision 2: Component lives in ContextualToolbar.tsx

**Chosen:** Define `NumericInput` at the top of `ContextualToolbar.tsx`, above the main export.

**Why:** It's used only in that file for now. Moving it to a shared file adds a new module dependency for a small utility — premature. If other files need it later, it's easy to extract.

### Decision 3: Apply to FIX height, PAD, and GAP inputs (primary strip only)

**Chosen:** Replace the three most user-facing inputs: FIX height, PAD, and GAP. The overflow panel inputs (RAD, BORD, SZ, STK) are inside the `SettingsPanel` inner component and can be addressed in a follow-up.

**Why:** These three are the primary interactive controls and most likely to trigger user frustration. Scope is kept minimal.

## Risks / Trade-offs

- **Stale local value**: If another actor changes the Craft.js height prop while the user has the input focused (e.g., undo, another panel), the input won't update. This is the correct behavior for a focused input — similar to how all design tools handle concurrent edits. The next time the user focuses and blurs, the latest value will be shown.
- **isFocused ref**: Using a ref instead of state for focus tracking avoids an extra re-render cycle. The ref is reliable because focus/blur are synchronous browser events.
