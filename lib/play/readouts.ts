import {
  allocationProgress,
  departmentProgress,
  type Answers,
  type Department,
  type Fmt,
  type ReadBar,
  type ReadRow,
  type Shape,
} from "@/lib/play/types";

export type ResolvedRow = {
  label: string;
  value: string;
  /** Signed movement from the opening number, in display units. */
  delta: number;
  /** Movement as a share of the row's full swing, -1 … 1. */
  drift: number;
  /** True when the movement is a good one for this row. */
  good: boolean;
  live: boolean;
};

const fmtNumber = (n: number, digits = 1) =>
  Number.isInteger(n) ? String(n) : n.toFixed(digits);

export function formatRead(value: number, fmt: Fmt = "count"): string {
  switch (fmt) {
    case "money":
      return value >= 100
        ? `₹${fmtNumber(value / 100, 2)} Cr`
        : `₹${fmtNumber(value)} L`;
    case "moneyK":
      return `₹${fmtNumber(value)} K`;
    case "pct":
      return `${fmtNumber(value)}%`;
    case "months":
      return `${fmtNumber(value)} mo`;
    case "days":
      return `${Math.round(value)} d`;
    case "hours":
      return `${fmtNumber(value)} hrs`;
    case "ratio":
      return `${fmtNumber(value)}×`;
    case "count":
    default:
      return Math.round(value).toLocaleString("en-IN");
  }
}

/**
 * Push a row through the live strategy shape. Axis 50 is the opening number,
 * and until something is committed every row sits at its opening number.
 */
export function resolveRow(
  row: ReadRow,
  shape: Shape,
  active = true,
): ResolvedRow {
  if (row.text !== undefined || row.base === undefined) {
    return {
      label: row.label,
      value: row.text ?? "—",
      delta: 0,
      drift: 0,
      good: true,
      live: false,
    };
  }

  const swing = row.swing ?? 0;
  const drift = active && row.axis ? (shape[row.axis] - 50) / 50 : 0;
  const delta = drift * swing;
  const raw = Math.max(0, row.base + delta);

  return {
    label: row.label,
    value: formatRead(raw, row.fmt),
    delta,
    drift,
    good: row.invert ? delta <= 0 : delta >= 0,
    live: Boolean(row.axis && swing),
  };
}

export function resolveBar(
  bar: ReadBar,
  department: Department | undefined,
  answers: Answers,
  shape: Shape,
): { label: string; pct: number; detail: string } {
  if (bar.source === "budget" && department) {
    const { used, total } = allocationProgress(department, answers);
    return {
      label: bar.label,
      pct: total ? Math.round((used / total) * 100) : 0,
      detail: `${used} / ${total}`,
    };
  }

  if (bar.source === "commit" && department) {
    const { done, total, pct } = departmentProgress(department, answers);
    return { label: bar.label, pct, detail: `${done} / ${total}` };
  }

  const value = bar.axis ? shape[bar.axis] : 0;
  return { label: bar.label, pct: value, detail: `${value} / 100` };
}
