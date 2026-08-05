import type { MetricKey, Metrics } from "@/lib/simulation/types";

/** Money arrives in ₹ lakh; render it the way an Indian operator reads it. */
export function formatMoney(lakh: number): string {
  const abs = Math.abs(lakh);
  const sign = lakh < 0 ? "-" : "";
  if (abs >= 100) {
    const cr = abs / 100;
    return `${sign}₹${cr >= 10 ? cr.toFixed(1) : cr.toFixed(2)} Cr`;
  }
  if (abs >= 10 || Number.isInteger(abs)) return `${sign}₹${Math.round(abs)} L`;
  return `${sign}₹${abs.toFixed(1)} L`;
}

export function formatCount(value: number): string {
  return Math.round(value).toLocaleString("en-IN");
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatMetric(key: MetricKey, value: number): string {
  switch (key) {
    case "cash":
    case "revenue":
    case "burn":
      return formatMoney(value);
    case "customers":
    case "employees":
      return formatCount(value);
    case "morale":
    case "share":
    case "trust":
      return formatPercent(value);
    default:
      return String(value);
  }
}

export function formatDelta(key: MetricKey, value: number): string {
  const sign = value > 0 ? "+" : "";
  switch (key) {
    case "cash":
    case "revenue":
    case "burn":
      return `${sign}${formatMoney(value)}`;
    case "customers":
    case "employees":
      return `${sign}${formatCount(value)}`;
    default:
      return `${sign}${Math.round(value * 10) / 10}%`;
  }
}

export function formatRunway(months: number): string {
  if (!Number.isFinite(months) || months >= 99) return "99+ mo";
  return `${months.toFixed(1)} mo`;
}

/** Metrics where an increase is bad news. */
export const INVERTED: MetricKey[] = ["burn"];

export function isGoodDelta(key: MetricKey, value: number): boolean {
  return INVERTED.includes(key) ? value < 0 : value > 0;
}

export function metricsSnapshot(metrics: Metrics) {
  return { ...metrics };
}
