/**
 * Number helpers for the Nadi Wear simulation, ported 1:1 from the shipped
 * `NadiWear.html` bundle so every figure on screen reads exactly as it did there.
 *
 * The originals were single-letter minified names; the behaviour is unchanged:
 *   te -> num, re -> pw, Se -> clamp, z -> inr, Tr -> lakh,
 *   ft -> cr, j -> n0, ie -> n1, xn -> n2, $ -> pct
 */

/** Coerce anything to a finite number, defaulting to 0. Inputs are often "" from a text field. */
export const num = (v: unknown): number => {
  const t = Number(v);
  return Number.isFinite(t) ? t : 0;
};

/** `max(0, x) ** p` -- the diminishing-returns curve every spend line runs on. */
export const pw = (v: unknown, p: number): number => Math.pow(Math.max(0, num(v)), p);

export const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, v));

/** Rupees, rounded, Indian grouping. Negative renders as `-₹1,23,456`, never `₹-1,23,456`. */
export const inr = (v: number): string =>
  (v < 0 ? "-" : "") + "₹" + Math.abs(Math.round(num(v))).toLocaleString("en-IN");

/** A figure already expressed in lakhs -- `₹12.5L`. */
export const lakh = (v: number): string =>
  "₹" + num(v).toLocaleString("en-IN", { maximumFractionDigits: 2 }) + "L";

/** Rupees rendered in crore -- `₹1.09 Cr`. */
export const cr = (v: number): string =>
  (v < 0 ? "-" : "") +
  "₹" +
  Math.abs(num(v) / 1e7).toLocaleString("en-IN", { maximumFractionDigits: 2 }) +
  " Cr";

export const n0 = (v: number): string => Math.round(num(v)).toLocaleString("en-IN");

export const n1 = (v: number): string =>
  num(v).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const n2 = (v: number): string =>
  num(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const pct = (v: number): string => n1(v) + "%";

/**
 * Arrow-key / spinner handler for `<input type="number">` that preserves decimal precision.
 *
 * The browser's native spinner rounds to the nearest step multiple, so typing "2.5" into an
 * input with step="1" and pressing Up yields 3 instead of 3.5.  This handler intercepts
 * ArrowUp / ArrowDown, computes the next value with exact step arithmetic, clamps to min/max,
 * and dispatches a synthetic change so React-controlled inputs update immediately.
 */
export function spinnerKeyDown(
  e: React.KeyboardEvent<HTMLInputElement>,
  { step = 1, min, max, onChange }: { step?: number; min?: number; max?: number; onChange: (v: string) => void },
) {
  if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
  e.preventDefault();
  const raw = (e.target as HTMLInputElement).value;
  const current = raw === "" ? 0 : Number(raw);
  if (!Number.isFinite(current)) return;
  const dir = e.key === "ArrowUp" ? 1 : -1;
  let next = current + dir * step;
  // Round to avoid floating-point drift (e.g. 2.6000000000000001)
  const decimals = String(step).includes(".") ? String(step).split(".")[1].length : 0;
  next = Number(next.toFixed(decimals));
  if (min != null) next = Math.max(min, next);
  if (max != null) next = Math.min(max, next);
  onChange(String(next));
}
