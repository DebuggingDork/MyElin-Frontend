"use client";

import { asNumber, formatInr } from "@/lib/api/catalog";
import type { BalanceSheetSchema, Money } from "@/lib/api/types";

/**
 * The company's position as at the quarter close, in the vertical format: assets, then equity
 * and liabilities, each total ruled off.
 *
 * Sits directly under BalanceSheet.tsx (which, despite the filename, prints the *statement of
 * operations*) and is deliberately its own document rather than more rows on that one. The
 * statement covers a period -- "for the quarter" -- and the position covers an instant --
 * "as at" -- so merging them would put two different reporting bases under one heading.
 *
 * It borrows that component's scoped `--bs-*` paper palette by declaring the same custom
 * properties, so the two read as one printed packet inside the dark dashboard. Gridlines are
 * drawn in the soft paper rule rather than the reference's full black box: the ruled subtotal
 * and the double rule under the grand total are what carry the structure here, same as they do
 * on the statement above.
 */

type Line = {
  label: string;
  /** The `Note` column -- how the figure was arrived at, not a note *number*: the engine does
   *  not emit numbered notes, and inventing numbering would promise a notes section that does
   *  not exist. */
  note: string;
  amount: Money | null;
};

export function QuarterBalanceSheet({
  quarterNumber,
  sheet,
  closingCash,
}: {
  quarterNumber: number;
  sheet: BalanceSheetSchema | null | undefined;
  /** `outcome.closing_cash_inr`. The statement above already reports this exact figure for this
   *  exact instant, so the position can show it even when the engine sent no cash line. */
  closingCash?: Money | null;
}) {
  return (
    <div
      className="min-w-0 overflow-hidden rounded-xl border"
      style={{
        // @ts-expect-error -- custom properties aren't in the CSSProperties type
        "--bs-paper": "#faf9f5",
        "--bs-ink": "#181a1e",
        "--bs-ink-soft": "#585d66",
        "--bs-rule": "#d9d8d2",
        "--bs-rule-strong": "#181a1e",
        "--bs-bad": "#a3352f",
        borderColor: "var(--bs-rule)",
        background: "var(--bs-paper)",
        color: "var(--bs-ink)",
      }}
    >
      <div className="border-b px-5 py-4" style={{ borderColor: "var(--bs-rule)" }}>
        <p
          className="text-[10.5px] uppercase tracking-[0.14em]"
          style={{ color: "var(--bs-ink-soft)" }}
        >
          Balance sheet · unaudited
        </p>
        <p className="mt-0.5 text-[15px] font-semibold">
          As at close of quarter {quarterNumber}
          {sheet?.as_at ? ` · ${sheet.as_at}` : ""}
        </p>
      </div>

      {sheet ? (
        <SheetBody sheet={sheet} closingCash={closingCash} />
      ) : (
        <p className="px-5 py-6 text-[12px] italic" style={{ color: "var(--bs-ink-soft)" }}>
          No position reported for this quarter.
        </p>
      )}
    </div>
  );
}

function SheetBody({
  sheet: s,
  closingCash,
}: {
  sheet: BalanceSheetSchema;
  closingCash?: Money | null;
}) {
  const nonCurrentAssets: Line[] = [
    { label: "Property, Plant & Equipment", note: "net of depreciation", amount: s.property_plant_equipment_inr },
    { label: "Intangible Assets", note: "capitalised innovation, amortised", amount: s.intangible_assets_inr },
    { label: "Investments", note: "held beyond twelve months", amount: s.non_current_investments_inr },
    { label: "Other Non-Current Assets", note: "", amount: s.other_non_current_assets_inr },
  ];

  const currentAssets: Line[] = [
    { label: "Inventories", note: "finished units at cost", amount: s.inventories_inr },
    { label: "Investments", note: "treasury, within twelve months", amount: s.current_investments_inr },
    { label: "Trade Receivables", note: "sales invoiced, not yet collected", amount: s.trade_receivables_inr },
    {
      label: "Cash And Cash Equivalents",
      note: "closing cash balance",
      amount: s.cash_and_equivalents_inr ?? closingCash ?? null,
    },
    { label: "Other Current Assets", note: "", amount: s.other_current_assets_inr },
  ];

  const equity: Line[] = [
    { label: "Share Capital", note: "issued and paid up", amount: s.share_capital_inr },
    { label: "Retained Earnings", note: "accumulated profit and loss", amount: s.retained_earnings_inr },
    { label: "Other Equity", note: "", amount: s.other_equity_inr },
  ];

  const nonCurrentLiabilities: Line[] = [
    { label: "Long-Term Borrowings", note: "credit facility drawn", amount: s.long_term_borrowings_inr },
    { label: "Long-Term Provisions", note: "", amount: s.long_term_provisions_inr },
    { label: "Deferred Tax Liabilities (Net)", note: "", amount: s.deferred_tax_liabilities_inr },
    { label: "Other Non-Current Liabilities", note: "", amount: s.other_non_current_liabilities_inr },
  ];

  const currentLiabilities: Line[] = [
    { label: "Short-Term Borrowings", note: "repayable within twelve months", amount: s.short_term_borrowings_inr },
    { label: "Trade Payables", note: "owed to suppliers", amount: s.trade_payables_inr },
    { label: "Other Current Liabilities", note: "", amount: s.other_current_liabilities_inr },
    { label: "Short-Term Provisions", note: "warranty cover", amount: s.short_term_provisions_inr },
  ];

  /* The one check that makes a balance sheet a balance sheet. Only worth showing when both
     totals actually arrived -- a partial position has nothing to tie out. Rounded to the rupee
     because the engine sends Decimal strings and sub-rupee drift is not a real imbalance. */
  const assets = s.total_assets_inr;
  const claims = s.total_equity_and_liabilities_inr;
  const tiesOut =
    assets != null && claims != null
      ? Math.round(asNumber(assets)) === Math.round(asNumber(claims))
      : null;

  return (
    <div className="px-5 py-5">
      <table className="w-full border-collapse text-left">
        <colgroup>
          <col />
          <col className="w-[34%]" />
          <col className="w-[24%]" />
        </colgroup>
        <thead>
          <tr>
            <Th>Particulars</Th>
            <Th className="hidden sm:table-cell">Note</Th>
            <Th align="right">Amt</Th>
          </tr>
        </thead>

        <tbody>
          <GroupHeading>Assets</GroupHeading>

          <SubHeading>Non-Current Assets:</SubHeading>
          {nonCurrentAssets.map((l) => (
            <Row key={l.label} line={l} />
          ))}

          <SubHeading spaced>Current Assets:</SubHeading>
          {currentAssets.map((l) => (
            <Row key={l.label} line={l} />
          ))}

          <TotalRow label="Total Assets" amount={assets} />

          <GroupHeading spaced>Equity And Liabilities</GroupHeading>

          <SubHeading>Equity</SubHeading>
          {equity.map((l) => (
            <Row key={l.label} line={l} />
          ))}

          <SubHeading spaced>Non-Current Liabilities:</SubHeading>
          {nonCurrentLiabilities.map((l) => (
            <Row key={l.label} line={l} />
          ))}

          <SubHeading spaced>Current Liabilities:</SubHeading>
          {currentLiabilities.map((l) => (
            <Row key={l.label} line={l} />
          ))}

          <TotalRow label="Total Equity And Liabilities" amount={claims} grand />
        </tbody>
      </table>

      {tiesOut === false && (
        <p className="mt-3 text-[11.5px]" style={{ color: "var(--bs-bad)" }}>
          Total equity and liabilities does not equal total assets — the reported position is
          out by {formatInr(Math.abs(asNumber(assets) - asNumber(claims)))}.
        </p>
      )}

      {s.gap_reason && (
        <p className="mt-3 text-[11.5px] italic" style={{ color: "var(--bs-ink-soft)" }}>
          {s.gap_reason}
        </p>
      )}
    </div>
  );
}

function Th({
  children,
  align,
  className = "",
}: {
  children: React.ReactNode;
  align?: "right";
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`border-b pb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
        align === "right" ? "text-right" : ""
      } ${className}`}
      style={{ borderColor: "var(--bs-rule-strong)", color: "var(--bs-ink-soft)" }}
    >
      {children}
    </th>
  );
}

/** `Assets` / `Equity And Liabilities` -- the two halves, underlined as on a ruled sheet. */
function GroupHeading({ children, spaced }: { children: React.ReactNode; spaced?: boolean }) {
  return (
    <tr>
      <td colSpan={3} className={spaced ? "pt-6" : "pt-4"}>
        <span className="text-[12.5px] font-bold italic underline underline-offset-4">
          {children}
        </span>
      </td>
    </tr>
  );
}

function SubHeading({ children, spaced }: { children: React.ReactNode; spaced?: boolean }) {
  return (
    <tr>
      <td colSpan={3} className={`pb-1 text-[12px] font-semibold ${spaced ? "pt-4" : "pt-2"}`}>
        {children}
      </td>
    </tr>
  );
}

function Row({ line }: { line: Line }) {
  const hasValue = line.amount !== null && line.amount !== undefined;

  return (
    <tr>
      <td
        className="border-b py-1 pl-3 text-[12.5px]"
        style={{ borderColor: "var(--bs-rule)", color: "var(--bs-ink-soft)" }}
      >
        {line.label}
      </td>
      <td
        className="hidden border-b py-1 pl-3 text-[11px] sm:table-cell"
        style={{ borderColor: "var(--bs-rule)", color: "var(--bs-ink-soft)" }}
      >
        {line.note}
      </td>
      <td
        className="border-b py-1 pl-3 text-right"
        style={{ borderColor: "var(--bs-rule)" }}
      >
        {hasValue ? (
          <span className="num whitespace-nowrap text-[13.5px] font-medium tabular-nums">
            {formatInr(line.amount)}
          </span>
        ) : (
          <span className="text-[11.5px] italic" style={{ color: "var(--bs-ink-soft)" }}>
            not reported
          </span>
        )}
      </td>
    </tr>
  );
}

function TotalRow({
  label,
  amount,
  grand,
}: {
  label: string;
  amount: Money | null;
  grand?: boolean;
}) {
  const hasValue = amount !== null && amount !== undefined;
  const border = grand ? "3px double var(--bs-rule-strong)" : "1px solid var(--bs-rule-strong)";

  return (
    <tr>
      <td className="pt-2 text-[13px] font-semibold" style={{ borderTop: border }}>
        {label}
      </td>
      <td className="hidden sm:table-cell" style={{ borderTop: border }} />
      <td className="pt-2 pl-3 text-right" style={{ borderTop: border }}>
        {hasValue ? (
          <span
            className={`num whitespace-nowrap tabular-nums ${grand ? "text-[16px] font-bold" : "text-[14px] font-semibold"}`}
          >
            {formatInr(amount)}
          </span>
        ) : (
          <span className="text-[11.5px] italic" style={{ color: "var(--bs-ink-soft)" }}>
            not reported
          </span>
        )}
      </td>
    </tr>
  );
}
