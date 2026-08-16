/**
 * Presentation-only formatting.
 *
 * Everything here runs at the moment a value is *rendered*. Nothing in this module touches a
 * stored value, an API payload, a criterion id, a dictionary key or a request body -- the
 * report the backend sends and the report the screen shows carry the same numbers, and a
 * humanised label is never sent back or used as a lookup key.
 *
 * Two problems it exists to solve, both of them the engine's honest output read literally:
 *
 *   1. Identifiers. The scoring engine names its traits, criteria, gates, modifiers and
 *      evidence keys in snake_case (`systems_thinking_2`, `sales_capacity`). Those are the
 *      names the API and the docs use, so they stay the ids -- but a student reading a report
 *      should see `systems thinking 2`, not a column name.
 *   2. Decimals. Money and scores arrive as full-precision Decimal strings
 *      (`3252.63217694388031872059315`) and the engine's own prose quotes them at the same
 *      precision. Two places to round, therefore: the value, and the sentence it appears in.
 */

/** The longest decimal tail this UI ever shows. */
export const DISPLAY_DECIMALS = 2;

const EM_DASH = "—";

/** Coerce an API scalar to a number. Returns null -- not 0 -- when there is nothing to show. */
function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/** `-0` prints as `-0`; nobody wants to read that on a score. */
const unsignZero = (n: number): number => (Object.is(n, -0) ? 0 : n);

/**
 * `systems_thinking_2` → `systems thinking 2`, `finance_admin` → `finance admin`.
 *
 * Display only. Call this on the way into JSX, never on the value used as a React key, a map
 * lookup, or anything sent back to the API.
 */
export function humanizeId(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  return value.replace(/_+/g, " ");
}

/**
 * A rounded figure with a fixed decimal tail -- `6.35841796607` → `6.36`, `5` → `5.00`.
 * Rounds (via `toFixed`), never truncates. `null`/`undefined`/non-numeric render as an em dash.
 */
export function formatDecimal(
  value: string | number | null | undefined,
  decimals: number = DISPLAY_DECIMALS,
): string {
  const n = toNumber(value);
  if (n === null) return EM_DASH;
  return unsignZero(Number(n.toFixed(decimals))).toFixed(decimals);
}

/**
 * The same rounding, with a trailing-zero tail dropped -- `15.0000000000` → `15`,
 * `3252.63217694388` → `3252.63`. Use where a whole number should read as one (points,
 * counts, modifier deltas); use `formatDecimal` where the figure is a measurement and the
 * two-place tail is part of how it reads.
 */
export function formatNumeric(
  value: string | number | null | undefined,
  maxDecimals: number = DISPLAY_DECIMALS,
): string {
  const n = toNumber(value);
  if (n === null) return EM_DASH;
  return String(unsignZero(Number(n.toFixed(maxDecimals))));
}

/** `formatNumeric` with an explicit sign, for deltas that read as `+3` / `-4`. */
export function formatSigned(
  value: string | number | null | undefined,
  maxDecimals: number = DISPLAY_DECIMALS,
): string {
  const n = toNumber(value);
  if (n === null) return EM_DASH;
  const rounded = unsignZero(Number(n.toFixed(maxDecimals)));
  return `${rounded >= 0 ? "+" : ""}${rounded}`;
}

/** A percentage from a 0-100 figure. The `%` is part of the display, not of the value. */
export function formatPercent(
  value: string | number | null | undefined,
  decimals: number = DISPLAY_DECIMALS,
): string {
  const n = toNumber(value);
  if (n === null) return EM_DASH;
  return `${formatDecimal(n, decimals)}%`;
}

/**
 * Any run of 3+ decimal places inside free text. Deliberately narrow: `7,150,000.00` and
 * `19.10` are already readable and must survive untouched, and requiring three places means a
 * date or a version number (`1.2.3`) can never match either.
 */
const LONG_DECIMAL = /\d+\.\d{3,}/g;

/**
 * A snake_case identifier sitting inside a sentence (`buffer_preserved=True`). The lookbehind
 * keeps it away from anything path-shaped, where an underscore is part of an address rather
 * than a word gap.
 */
const SNAKE_TOKEN = /(?<![/\w])[a-z][a-z0-9]*(?:_[a-z0-9]+)+/g;

/**
 * The engine writes its own prose -- gate details, criterion details, modifier reasons -- and
 * quotes its own figures at full precision inside it. This rounds those figures and opens up
 * any snake_case identifier, leaving the sentence otherwise exactly as the backend wrote it.
 *
 * `"Sales Capacity (2725.0000 effective) bound 216.4837... leads"` reads as
 * `"Sales Capacity (2725 effective) bound 216.48 leads"`.
 */
export function formatDisplayText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(SNAKE_TOKEN, (token) => humanizeId(token))
    .replace(LONG_DECIMAL, (match) => formatNumeric(match));
}
