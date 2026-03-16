## 1. Add NumericInput Component

- [x] 1.1 Define a `NumericInput` component at the top of `ContextualToolbar.tsx` (above the main export) with props: `value: number`, `onChange: (v: number) => void`, `min?: number`, `className?: string`, `suffix?: string`
- [x] 1.2 Implement local string state `[local, setLocal]` initialized from `String(value)`; use a `isFocused` ref to track focus
- [x] 1.3 Add `useEffect` that syncs `local` from `value` prop only when `isFocused.current === false`
- [x] 1.4 Implement `commit()` function: parse `local` as integer; if NaN fall back to `value`; clamp to `min` if provided; call `onChange(clamped)`; normalize `local` to the clamped string
- [x] 1.5 Wire `onFocus` → set `isFocused.current = true`, `onBlur` → set `isFocused.current = false` then call `commit()`, `onChange` → `setLocal(e.target.value)`, `onKeyDown` → call `commit()` on Enter

## 2. Replace Numeric Inputs in ContextualToolbar

- [x] 2.1 Replace the FIX height `<input>` with `<NumericInput value={fixedPx} onChange={(v) => setProp('height', `${v}px`)} min={1} className="..." />`
- [x] 2.2 Replace the PAD raw `<input>` with `<NumericInput value={selected.props.padding || 0} onChange={(v) => setProp('padding', v)} min={0} className="..." />`
- [x] 2.3 Replace the GAP raw `<input>` with `<NumericInput value={selected.props.gap || 0} onChange={(v) => setProp('gap', v)} min={0} className="..." />`
