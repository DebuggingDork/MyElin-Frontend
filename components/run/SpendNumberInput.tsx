"use client";

import { useState } from "react";
import { clampSpend, parseSpend, trimSpend } from "@/components/run/spendValue";
import { cn } from "@/lib/utils";

/**
 * The exact-entry half every spend representation shares: a real text field, not a stepped
 * control. Backend spend columns are Numeric(10,4) with no min/max/step, so 1.74 is as valid as
 * 2 -- typing commits live (not only on blur) so running totals elsewhere stay current, while
 * partial input like "1." is left alone rather than being coerced to 1 mid-keystroke.
 *
 * `step` therefore drives the *increments* (the arrow keys here, and the +/- buttons the callers
 * draw) rather than snapping typed figures to a grid -- rounding 1.74 up to 1.75 would throw away
 * precision the API accepts. `min`/`max` are hard, and hold on every route in: typing, arrows,
 * and a `value` handed down by a parent that has clamped it to the remaining budget.
 *
 * It is drawn as a bordered box rather than as bare text. Sitting beside a graphic, an
 * unadorned number reads as a *readout*, and nobody tries to type into a readout.
 */
export function SpendNumberInput({
  value,
  onChange,
  disabled,
  label,
  size = "md",
  min = 0,
  max,
  step = 0.25,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  /** Screen-reader name -- these fields sit next to a graphic, not a visible <label>. */
  label: string;
  size?: "sm" | "md";
  /** Floor for every route in. */
  min?: number;
  /** Ceiling for every route in. Omitted means uncapped. */
  max?: number;
  /** Granularity of the arrow keys. Not of typed entry. */
  step?: number;
}) {
  const ceiling = max ?? Number.POSITIVE_INFINITY;
  const clamp = (v: number) => clampSpend(v, min, ceiling);

  const [text, setText] = useState(() => trimSpend(value));
  const [editing, setEditing] = useState(false);
  // Mirrors the last `value` this field saw, so a change made *elsewhere* -- a dial dragged, a
  // +/- pressed, a parent clamping to the budget that is left -- rewrites the text even while
  // the field holds focus. Derived during render rather than in an effect, which would show the
  // stale figure for a frame on every drag move.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if (!editing || parseSpend(text) !== value) setText(trimSpend(value));
  }

  function nudge(direction: 1 | -1) {
    const next = clamp(value + direction * step);
    setText(trimSpend(next));
    onChange(next);
  }

  return (
    // A <label> and not a <div>: clicking anywhere in the box -- the ₹, the unit, the padding --
    // then puts the caret in the field, which is most of what makes it read as editable.
    <label
      className={cn(
        "spend-field inline-flex items-baseline gap-1 rounded-lg border bg-[var(--panel)]",
        "transition-colors focus-within:border-teal/60 focus-within:bg-[var(--panel-2)]",
        disabled
          ? "cursor-not-allowed border-line opacity-50"
          : "cursor-text border-line hover:border-line-2",
        size === "sm" ? "px-2 py-1" : "w-full px-3 py-1.5",
      )}
    >
      <span className={`num text-faint ${size === "sm" ? "text-[11px]" : "text-[13px]"}`}>₹</span>
      <input
        type="text"
        inputMode="decimal"
        enterKeyHint="done"
        disabled={disabled}
        aria-label={`${label} spend in lakhs`}
        value={editing ? text : trimSpend(value)}
        onFocus={(e) => {
          setEditing(true);
          setText(trimSpend(value));
          // Tapping the figure on a phone should let you replace it, not land a caret in the
          // middle of it.
          e.currentTarget.select();
        }}
        onChange={(e) => {
          const raw = e.target.value;
          setText(raw);
          // An emptied field commits the floor -- clearing a line and saving must not persist
          // the number that was there -- while the box stays visibly empty, because an editing
          // field renders `text` rather than `value`.
          if (raw.trim() === "") {
            onChange(min);
            return;
          }
          const n = parseSpend(raw);
          if (n !== null) onChange(clamp(n));
        }}
        onBlur={() => {
          setEditing(false);
          // Unparseable input snaps back to the figure actually held rather than zeroing the
          // line: `value` is the last thing that committed successfully.
          const next = clamp(parseSpend(text) ?? value);
          onChange(next);
          setText(trimSpend(next));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Escape") {
            e.currentTarget.blur();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            nudge(1);
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            nudge(-1);
          }
        }}
        className={cn(
          "num min-w-0 bg-transparent font-semibold text-ink outline-none disabled:cursor-not-allowed",
          size === "sm" ? "w-[3.75rem] text-[15px]" : "w-full text-[22px]",
        )}
      />
      <span className={`num text-faint ${size === "sm" ? "text-[11px]" : "text-[13px]"}`}>L</span>
    </label>
  );
}
