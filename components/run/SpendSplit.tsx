"use client";

import { Minus, Plus } from "lucide-react";
import { formatLakhs } from "@/lib/api/catalog";
import { SpendNumberInput } from "@/components/run/SpendNumberInput";

export type SplitLine = { key: string; label: string; hint?: string; value: number };

/**
 * A composition view, for the departments where the *split* is the decision rather than the
 * absolute amounts. docs/12-quarter-1-reference.md is explicit about this for Sales ("the Sales
 * budget's split between 'more bandwidth' (Reps) and 'better tools' (CRM) is a genuine
 * trade-off"), and R&D's two lines both feed one conversion ceiling at different weights -- in
 * both cases the reader's real question is "how is this divided", which a per-line dial actively
 * hides. So the department total leads, a stacked bar carries the proportions, and each row
 * states its own share.
 *
 * Segments are one hue in descending lightness (never separate hues -- these are parts of one
 * measure, not competing series) separated by 2px surface gaps, so neighbouring segments stay
 * distinguishable without a border drawn around each.
 */
export function SpendSplit({
  lines,
  color,
  disabled,
  onChange,
}: {
  lines: SplitLine[];
  color: string;
  disabled?: boolean;
  onChange: (key: string, value: number) => void;
}) {
  const total = lines.reduce((sum, l) => sum + l.value, 0);

  return (
    <div className="glass-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="eyebrow text-faint">Department split</p>
        <p className="num text-[15px] font-semibold text-ink">{formatLakhs(total)}</p>
      </div>

      <div className="mt-3 flex h-3 overflow-hidden rounded-full" style={{ background: "var(--panel-2)" }}>
        {total > 0 &&
          lines.map((line, i) => {
            const share = line.value / total;
            if (share <= 0) return null;
            return (
              <div
                key={line.key}
                title={`${line.label} · ${(share * 100).toFixed(1)}%`}
                style={{
                  width: `${share * 100}%`,
                  background: `color-mix(in srgb, ${color} ${88 - i * 22}%, transparent)`,
                  // The 2px separator is surface-colored space, not a stroke -- a border here
                  // would add ink that isn't data.
                  marginRight: i < lines.length - 1 ? 2 : 0,
                }}
              />
            );
          })}
      </div>

      <div className="mt-4 space-y-1">
        {lines.map((line, i) => {
          const share = total > 0 ? line.value / total : 0;
          return (
            <div
              key={line.key}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line py-2.5 last:border-b-0"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: `color-mix(in srgb, ${color} ${88 - i * 22}%, transparent)` }}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium text-ink">{line.label}</span>
                {line.hint && <span className="block truncate text-[11px] text-faint">{line.hint}</span>}
              </span>

              <span className="num shrink-0 text-[12px] tabular-nums text-faint">
                {total > 0 ? `${(share * 100).toFixed(0)}%` : "—"}
              </span>

              <span className="shrink-0">
                <SpendNumberInput
                  size="sm"
                  label={line.label}
                  value={line.value}
                  disabled={disabled}
                  onChange={(v) => onChange(line.key, v)}
                />
              </span>

              <span className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  disabled={disabled || line.value <= 0}
                  aria-label={`Decrease ${line.label}`}
                  onClick={() => onChange(line.key, Number(Math.max(0, line.value - 0.25).toFixed(2)))}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-line text-dim transition-transform duration-150 ease-out active:scale-95 disabled:opacity-30"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Increase ${line.label}`}
                  onClick={() => onChange(line.key, Number((line.value + 0.25).toFixed(2)))}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-line text-dim transition-transform duration-150 ease-out active:scale-95 disabled:opacity-30"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
