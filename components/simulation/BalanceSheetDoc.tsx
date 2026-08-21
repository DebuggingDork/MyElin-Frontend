"use client";

/**
 * The balance sheet, set the way a company actually files one.
 *
 * Schedule III order and nothing else: equity and liabilities first, assets second, roman
 * numerals over numbered groups over lettered lines, a note column, and the two totals that
 * have to agree. A CEO who has seen a real one should recognise this on sight — that
 * recognition is most of what makes the figures land as consequences rather than as a score.
 *
 * Printed on paper in both themes. A document does not change colour with the room, and half
 * of what makes a filed statement read as one is having seen exactly this before: black on
 * off-white, hairline rules, totals ruled twice. `.statement` (globals.css) carries its own
 * palette and opts out of the app's.
 *
 * Every line prints whether or not it carries a figure. A balance sheet with the empty rows
 * removed is not a shorter balance sheet, it is a different one: nil is a fact about the
 * company, and the reader has to see that the line was considered.
 */

import { inr, n0 } from "@/lib/simulation/format";
import type { BalanceView } from "@/lib/simulation/balance";
import { cn } from "@/lib/utils";

type Kind = "line" | "total";

/** Nil is a dash on a real sheet, never a zero; a negative is in brackets, never a minus. */
function figure(value: number): string {
  const rounded = Math.round(value);
  if (rounded === 0) return "—";
  return rounded < 0 ? `(${inr(Math.abs(rounded))})` : inr(rounded);
}

export function BalanceSheetDoc({
  open,
  close,
  title,
  caption,
  openLabel = "As at open",
  closeLabel = "As at close",
  note,
  className,
}: {
  open: BalanceView;
  close?: BalanceView;
  title: string;
  /** The line under the title: what this sheet is a sheet of. */
  caption: string;
  openLabel?: string;
  closeLabel?: string;
  note?: React.ReactNode;
  className?: string;
}) {
  const cols = close
    ? "grid-cols-[minmax(0,1fr)_5.5rem_5.5rem] sm:grid-cols-[minmax(0,1fr)_9rem_7rem_7rem]"
    : "grid-cols-[minmax(0,1fr)_6rem] sm:grid-cols-[minmax(0,1fr)_10rem_8rem]";

  const row = (
    label: string,
    pick: keyof BalanceView | ((view: BalanceView) => number),
    noteText: string,
    kind: Kind = "line",
  ) => {
    const read = (view: BalanceView) =>
      typeof pick === "function" ? pick(view) : (view[pick] as number);
    const total = kind === "total";
    return (
      <div
        key={label}
        className={cn(
          "grid items-baseline gap-x-3 sm:gap-x-4",
          cols,
          total
            ? "border-y-2 border-[var(--stmt-rule-2)] py-2 font-semibold"
            : "border-b border-[var(--stmt-rule)] py-[7px]",
        )}
      >
        <span className={cn("text-[13.5px] leading-snug", total ? "" : "pl-4 sm:pl-6")}>{label}</span>
        <span className="hidden text-[11px] text-[var(--stmt-faint)] sm:block">{noteText}</span>
        <span className="text-right font-mono text-[13px] tabular-nums text-[var(--stmt-ink-2)]">
          {figure(read(open))}
        </span>
        {close && (
          <span className="text-right font-mono text-[13px] tabular-nums text-[var(--stmt-ink)]">
            {figure(read(close))}
          </span>
        )}
      </div>
    );
  };

  const section = (numeral: string, label: string) => (
    <div className="mt-6 flex items-baseline gap-3 border-b-2 border-[var(--stmt-rule-2)] pb-1.5 first:mt-0">
      <span className="font-mono text-[12px] text-[var(--stmt-accent)]">{numeral}</span>
      <span className="text-[12px] font-semibold uppercase tracking-[0.18em]">{label}</span>
    </div>
  );

  const group = (n: number, label: string) => (
    <div className="mt-3 flex items-baseline gap-3 pb-0.5">
      <span className="font-mono text-[11px] text-[var(--stmt-faint)]">{n}</span>
      <span className="text-[12.5px] font-semibold">{label}</span>
    </div>
  );

  const checkOpen = open.liabilities + open.equity - open.assets;
  const checkClose = close ? close.liabilities + close.equity - close.assets : 0;

  return (
    <section
      className={cn(
        "statement overflow-x-auto border border-[var(--stmt-rule-2)] px-5 py-6 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.55)] sm:px-8 sm:py-8",
        className,
      )}
    >
      {/* Masthead, as a filed statement heads it. */}
      <header className="border-b-2 border-[var(--stmt-ink)] pb-3">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[var(--stmt-accent)]">
          Nadi Wear Private Limited
        </p>
        <h3 className="mt-1.5 font-serif text-[22px] leading-tight sm:text-[26px]">{title}</h3>
        <p className="mt-1 text-[12.5px] text-[var(--stmt-ink-2)]">{caption}</p>
        <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--stmt-faint)]">
          All amounts in ₹ · prepared on the same basis every quarter
        </p>
      </header>

      <div className="min-w-[34rem]">
        {/* Column heads */}
        <div
          className={cn(
            "mt-5 grid items-end gap-x-3 border-b border-[var(--stmt-rule-2)] pb-1.5 sm:gap-x-4",
            cols,
          )}
        >
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--stmt-faint)]">
            Particulars
          </span>
          <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--stmt-faint)] sm:block">
            Note
          </span>
          <span className="text-right font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--stmt-faint)]">
            {openLabel}
          </span>
          {close && (
            <span className="text-right font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--stmt-accent)]">
              {closeLabel}
            </span>
          )}
        </div>

        {section("I", "Equity and liabilities")}
        {group(1, "Shareholders' funds")}
        {row("(a) Share capital", "share", "seed round, fully paid")}
        {row("(b) Reserves and surplus", "re", "accumulated profit and loss")}
        {row("(c) Money received against share capital", "raised", "signed, not yet banked")}
        {group(2, "Non-current liabilities")}
        {row("(a) Long-term borrowings", "debt", "credit facility drawn")}
        {group(3, "Current liabilities")}
        {row("(a) Trade payables", "ap", "owed to suppliers")}
        {row("(b) Other current liabilities", "other", "accruals and provisions")}
        <div className="mt-4">
          {row("Total equity and liabilities", (view) => view.liabilities + view.equity, "", "total")}
        </div>

        {section("II", "Assets")}
        {group(1, "Non-current assets")}
        {row("(a) Property, plant and equipment", "equipment", "net of depreciation")}
        {row("(b) Intangible assets", "ip", "innovation board, amortised")}
        {group(2, "Current assets")}
        {row("(a) Inventories", "inventory", n0((close || open).invUnits) + " units at cost")}
        {row("(b) Trade receivables", "ar", "invoiced, uncollected")}
        {row("(c) Cash and cash equivalents", "cash", "bank balance")}
        <div className="mt-4">{row("Total assets", "assets", "", "total")}</div>

        {/* The check a reader runs first. */}
        <div className={cn("mt-5 grid items-baseline gap-x-3 pt-1 sm:gap-x-4", cols)}>
          <span className="text-[12.5px] font-semibold">Equity and liabilities less assets</span>
          <span className="hidden text-[11px] text-[var(--stmt-faint)] sm:block">
            nil on a sheet that balances
          </span>
          <span
            className={cn(
              "text-right font-mono text-[13px] tabular-nums",
              Math.round(checkOpen) === 0 ? "text-[var(--stmt-ink-2)]" : "text-[var(--stmt-negative)]",
            )}
          >
            {figure(checkOpen)}
          </span>
          {close && (
            <span
              className={cn(
                "text-right font-mono text-[13px] tabular-nums",
                Math.round(checkClose) === 0 ? "text-[var(--stmt-ink)]" : "text-[var(--stmt-negative)]",
              )}
            >
              {figure(checkClose)}
            </span>
          )}
        </div>
      </div>

      {note && (
        <p className="mt-5 border-t border-[var(--stmt-rule)] pt-3 text-[12.5px] leading-relaxed text-[var(--stmt-ink-2)]">
          {note}
        </p>
      )}
    </section>
  );
}
