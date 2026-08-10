"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { asNumber, formatInr } from "@/lib/api/catalog";
import type { CompanyOutcomeSchema } from "@/lib/api/types";

type Money = string | number | null | undefined;

/**
 * The quarter's outcome as an actual printed statement -- ruled subtotal lines, a double rule
 * under the grand total, right-aligned tabular figures -- instead of a flat label/value list in a
 * dark app card. Scoped to its own light "paper" palette via inline custom properties (same
 * technique as the newsprint screens) so it reads as a distinct printed document sitting inside
 * the dashboard, not just another dark panel.
 */
export function BalanceSheet({
  quarterNumber,
  outcome,
}: {
  quarterNumber: number;
  outcome: CompanyOutcomeSchema;
}) {
  const o = outcome;

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{
        // @ts-expect-error -- custom properties aren't in the CSSProperties type
        "--bs-paper": "#faf9f5",
        "--bs-ink": "#181a1e",
        "--bs-ink-soft": "#585d66",
        "--bs-rule": "#d9d8d2",
        "--bs-rule-strong": "#181a1e",
        borderColor: "var(--bs-rule)",
        background: "var(--bs-paper)",
        color: "var(--bs-ink)",
      }}
    >
      <div className="border-b px-5 py-4" style={{ borderColor: "var(--bs-rule)" }}>
        <p className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: "var(--bs-ink-soft)" }}>
          Statement of operations · unaudited
        </p>
        <p className="mt-0.5 text-[15px] font-semibold">Quarter {quarterNumber}</p>
      </div>

      <div className="space-y-5 px-5 py-5">
        <BsRow label="Units sold" value={o.units_sold.value} delta={o.units_sold.delta} isCount />

        <div>
          <BsSectionLabel>Revenue</BsSectionLabel>
          <BsRow label="Net revenue" value={o.revenue_inr.value} delta={o.revenue_inr.delta} />
          <BsSectionLabel>Less: cost of goods sold</BsSectionLabel>
          <BsRow label="COGS" value={o.cogs_inr.value} delta={o.cogs_inr.delta} negative />
          <BsSubtotal label="Gross profit" value={o.gross_profit_inr.value} delta={o.gross_profit_inr.delta} />
        </div>

        <div>
          <BsSectionLabel>Cash position</BsSectionLabel>
          <BsRow
            label="Net cash flow this quarter"
            value={o.net_cash_flow_inr.value}
            delta={o.net_cash_flow_inr.delta}
            signed
          />
          <BsRow label="Closing cash balance" value={o.closing_cash_inr.value} delta={o.closing_cash_inr.delta} />
          <BsRow
            label="Cash runway"
            value={o.cash_runway_quarters?.value}
            delta={o.cash_runway_quarters?.delta}
            gapReason={o.cash_runway_gap_reason}
            suffix=" quarters"
            isCount
          />
        </div>

        <BsSubtotal
          label="Estimated valuation"
          value={o.valuation_inr?.value}
          delta={o.valuation_inr?.delta}
          gapReason={o.valuation_gap_reason}
          grand
        />
      </div>
    </div>
  );
}

function BsSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-1.5 text-[10px] uppercase tracking-[0.1em]"
      style={{ color: "var(--bs-ink-soft)" }}
    >
      {children}
    </p>
  );
}

function BsRow({
  label,
  value,
  delta,
  gapReason,
  isCount,
  negative,
  signed,
  suffix = "",
}: {
  label: string;
  value: Money;
  delta?: Money;
  gapReason?: string | null;
  isCount?: boolean;
  negative?: boolean;
  signed?: boolean;
  suffix?: string;
}) {
  const hasValue = value !== null && value !== undefined;
  const deltaNum = delta === null || delta === undefined ? null : asNumber(delta);
  const n = hasValue ? asNumber(value) : 0;

  const display = !hasValue
    ? null
    : isCount
      ? `${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}${suffix}`
      : negative
        ? `(${formatInr(Math.abs(n))})`
        : signed && n >= 0
          ? `+${formatInr(n)}`
          : formatInr(n);

  return (
    <div className="flex items-baseline justify-between gap-3 py-1 pl-3">
      <span className="text-[12.5px]" style={{ color: "var(--bs-ink-soft)" }}>
        {label}
      </span>
      <span className="flex items-baseline gap-2">
        {deltaNum !== null && deltaNum !== 0 && (
          <span
            className="num flex items-center gap-0.5 text-[10.5px]"
            style={{ color: deltaNum >= 0 ? "#1a7a4c" : "#a3352f" }}
          >
            {deltaNum >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
            {isCount ? Math.abs(deltaNum).toLocaleString("en-IN", { maximumFractionDigits: 2 }) : formatInr(Math.abs(deltaNum))}
          </span>
        )}
        {hasValue ? (
          <span className="num text-[13.5px] font-medium tabular-nums">{display}</span>
        ) : (
          <span className="text-[11.5px] italic" style={{ color: "var(--bs-ink-soft)" }} title={gapReason ?? undefined}>
            {gapReason ?? "not reported"}
          </span>
        )}
      </span>
    </div>
  );
}

function BsSubtotal({
  label,
  value,
  delta,
  gapReason,
  grand,
}: {
  label: string;
  value: Money;
  delta?: Money;
  gapReason?: string | null;
  grand?: boolean;
}) {
  const hasValue = value !== null && value !== undefined;
  const n = hasValue ? asNumber(value) : 0;
  const deltaNum = delta === null || delta === undefined ? null : asNumber(delta);

  return (
    <div
      className="mt-1 flex items-baseline justify-between gap-3 pt-2"
      style={{
        borderTop: grand
          ? "3px double var(--bs-rule-strong)"
          : "1px solid var(--bs-rule-strong)",
      }}
    >
      <span className="text-[13px] font-semibold">{label}</span>
      <span className="flex items-baseline gap-2">
        {deltaNum !== null && deltaNum !== 0 && (
          <span
            className="num flex items-center gap-0.5 text-[10.5px]"
            style={{ color: deltaNum >= 0 ? "#1a7a4c" : "#a3352f" }}
          >
            {deltaNum >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
            {formatInr(Math.abs(deltaNum))}
          </span>
        )}
        {hasValue ? (
          <span className="num text-[16px] font-bold tabular-nums">{formatInr(n)}</span>
        ) : (
          <span className="text-[11.5px] italic" style={{ color: "var(--bs-ink-soft)" }} title={gapReason ?? undefined}>
            {gapReason ?? "not reported"}
          </span>
        )}
      </span>
    </div>
  );
}
