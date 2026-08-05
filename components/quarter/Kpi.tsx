"use client";

import { openingState } from "@/lib/quarter/catalog";
import { formatLakhs, type CompanyState } from "@/lib/quarter/types";

/* KPI header strip — Cash / Runway / Valuation / Investor Confidence.
   Reused on every screen in the quarter flow, per spec §4. */

export function KpiStrip({
  state = openingState,
  compact = false,
}: {
  state?: CompanyState;
  compact?: boolean;
}) {
  const items = [
    { label: "Cash", value: formatLakhs(state.cash_available) },
    { label: "Runway", value: `${state.cash_runway_months.toFixed(1)} mo` },
    { label: "Valuation", value: formatLakhs(state.valuation) },
    {
      label: "Investor confidence",
      value: `${state.investor_confidence_score}/100`,
    },
  ];

  return (
    <div
      className={
        compact
          ? "flex items-center gap-5 overflow-x-auto"
          : "grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4"
      }
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={
            compact ? "shrink-0" : "bg-raise px-4 py-3.5"
          }
        >
          <p className="eyebrow text-faint">{item.label}</p>
          <p
            className={`num font-semibold text-ink ${compact ? "mt-1 text-[13px]" : "mt-1.5 text-[17px]"}`}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
