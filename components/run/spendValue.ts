/**
 * The parse/clamp/format rules every spend control shares, so the arc, the columns, the split
 * rows and the bare number fields all agree on what a typed figure means. Kept out of the
 * components because a disagreement between them is exactly how a form ends up saving one number
 * while showing another.
 */

/** Backend spend columns are Numeric(10,4) -- four places is the finest figure that survives a
 *  round trip, so it is also the finest one worth holding in state. */
const DECIMALS = 4;

export function roundSpend(v: number): number {
  return Number(v.toFixed(DECIMALS));
}

/**
 * Reads what a decimal keypad can produce, and nothing else. Returns `null` -- not 0 -- for input
 * that is not a number yet or never will be, so a half-typed "1." is left alone rather than
 * coerced to 1, and "12..3" or a pasted "abc" does not silently zero the line.
 */
export function parseSpend(raw: string): number | null {
  const cleaned = raw.trim().replace(/[,\s₹]/g, "");
  if (cleaned === "") return null;
  if (!/^\d*\.?\d*$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Holds a figure inside the control's floor and ceiling. Anything non-finite lands on the floor
 *  rather than propagating NaN into a total. */
export function clampSpend(v: number, min = 0, max = Number.POSITIVE_INFINITY): number {
  if (!Number.isFinite(v)) return min;
  return roundSpend(Math.min(Math.max(v, min), max));
}

/** Display form: no trailing zeros, and a plain "0" rather than "0.0000" or "NaN". */
export function trimSpend(v: number): string {
  if (!Number.isFinite(v) || v === 0) return "0";
  return String(roundSpend(v));
}
