"use client";

import { useState } from "react";

/**
 * The exact-entry half every spend representation shares: a real text field, not a stepped
 * control. Backend spend columns are Numeric(10,4) with no min/max/step, so 1.74 is as valid as
 * 2 -- typing commits live (not only on blur) so running totals elsewhere stay current, while
 * partial input like "1." is left alone rather than being coerced to 1 mid-keystroke.
 */
export function SpendNumberInput({
  value,
  onChange,
  disabled,
  label,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  /** Screen-reader name -- these fields sit next to a graphic, not a visible <label>. */
  label: string;
  size?: "sm" | "md";
}) {
  const [text, setText] = useState(() => format(value));
  const [editing, setEditing] = useState(false);

  function format(v: number) {
    return v === 0 ? "0" : String(Number(v.toFixed(4)));
  }

  return (
    <span className="inline-flex items-baseline gap-1">
      <span className={`num text-faint ${size === "sm" ? "text-[11px]" : "text-[13px]"}`}>₹</span>
      <input
        type="text"
        inputMode="decimal"
        disabled={disabled}
        aria-label={`${label} spend in lakhs`}
        value={editing ? text : format(value)}
        onFocus={() => {
          setEditing(true);
          setText(format(value));
        }}
        onChange={(e) => {
          setText(e.target.value);
          const n = Number(e.target.value.replace(/[^0-9.]/g, ""));
          if (e.target.value !== "" && Number.isFinite(n)) onChange(n);
        }}
        onBlur={() => {
          setEditing(false);
          const n = Number(text.replace(/[^0-9.]/g, ""));
          onChange(Number.isFinite(n) && n >= 0 ? n : 0);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className={`num bg-transparent font-semibold text-ink outline-none disabled:cursor-not-allowed ${
          size === "sm" ? "w-[4.5rem] text-[15px]" : "w-full min-w-0 text-[22px]"
        }`}
      />
      <span className={`num text-faint ${size === "sm" ? "text-[11px]" : "text-[13px]"}`}>L</span>
    </span>
  );
}
