"use client";

/**
 * The balance sheet, on its own tab.
 *
 * A student reviewing a plan should not have to remember which department a rupee went to.
 * This is the one page where all of it lands at once: the sheet as the quarter opened, the
 * sheet with everything committed so far applied to it, and — once a quarter has closed — the
 * sheet as it actually ended, so the two can be read against each other.
 *
 * Reachable at any point in the quarter, which is the point: the close screen carries the same
 * document, but a decision is easier to take when you can check its effect while you are still
 * making it.
 */

import { balanceClosing, balanceCommitted, balanceOpening } from "@/lib/simulation/balance";
import { BalanceSheetDoc } from "@/components/simulation/BalanceSheetDoc";
import { Eyebrow, TeachingNote } from "@/components/simulation/Kit";
import { inr } from "@/lib/simulation/format";
import type { Budget, CompanyState, QuarterResultShape } from "@/lib/simulation/types";

export function BalanceSheetScreen({
  s,
  budget,
  history,
}: {
  s: CompanyState;
  budget: Budget;
  history: QuarterResultShape[];
}) {
  const open = balanceOpening(s);
  const planned = balanceCommitted(s, budget);
  const last = history[history.length - 1];

  /** What the plan has actually moved, in the order a reader would ask about it. */
  const moves = [
    { label: "Cash and bank", from: open.cash, to: planned.cash },
    { label: "Plant and equipment", from: open.equipment, to: planned.equipment },
    { label: "Intangible assets", from: open.ip, to: planned.ip },
    { label: "Borrowings", from: open.debt, to: planned.debt },
    { label: "Reserves and surplus", from: open.re, to: planned.re },
  ].filter((m) => Math.round(m.to - m.from) !== 0);

  return (
    <div className="space-y-5">
      <div>
        <Eyebrow tone="text-tone-bad">The position</Eyebrow>
        <h2 className="font-serif text-3xl text-ink">Balance sheet</h2>
        <p className="mt-2 max-w-3xl text-sm text-dim">
          Every rupee you have committed this quarter, on one page, in the form a company files
          it. The quarter&apos;s revenue, profit and closing cash are not here — those arrive
          when you close it.
        </p>
      </div>

      {/* What changed, before the sheet itself: a reader wants the movement first and the
          statement as the evidence for it. */}
      <div className="border border-line bg-raise">
        <div className="border-b border-line px-4 py-2.5">
          <Eyebrow>What this plan has moved so far</Eyebrow>
        </div>
        {moves.length === 0 ? (
          <p className="px-4 py-4 text-sm text-dim">
            Nothing committed yet. The two columns below are identical until you allocate.
          </p>
        ) : (
          <dl className="divide-y divide-line">
            {moves.map((move) => {
              const delta = move.to - move.from;
              return (
                <div
                  key={move.label}
                  className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 px-4 py-2.5 sm:grid-cols-[1fr_9rem_9rem_7rem]"
                >
                  <dt className="text-sm text-ink">{move.label}</dt>
                  <dd className="hidden text-right font-mono text-xs text-faint sm:block">
                    {inr(move.from)}
                  </dd>
                  <dd className="hidden text-right font-mono text-sm text-ink sm:block">
                    {inr(move.to)}
                  </dd>
                  <dd
                    className={
                      "text-right font-mono text-sm " +
                      (delta >= 0 ? "text-tone-good" : "text-tone-bad")
                    }
                  >
                    {(delta >= 0 ? "+" : "−") + inr(Math.abs(delta))}
                  </dd>
                </div>
              );
            })}
          </dl>
        )}
      </div>

      <BalanceSheetDoc
        title="Balance sheet"
        caption={"Quarter " + s.quarter + ", as it stands"}
        openLabel="As at open"
        closeLabel="With this plan"
        open={open}
        close={planned}
        note={
          <>
            Capitalised spend — plant, and anything started on the innovation board — moves from
            cash into assets. Credit drawn arrives as cash and as a borrowing. Operating spend
            and the people bill leave the bank and the reserves together, which is why the two
            totals still agree to the rupee.
          </>
        }
      />

      {last && (
        <>
          <div className="pt-2">
            <Eyebrow tone="text-tone-bad">For comparison</Eyebrow>
            <h3 className="font-serif text-xl text-ink">The last quarter you closed</h3>
          </div>
          <BalanceSheetDoc
            title="Balance sheet"
            caption={"Quarter " + last.q + ", as filed at the close"}
            open={balanceOpening(last.entering)}
            close={balanceClosing(last)}
          />
        </>
      )}

      <TeachingNote id="statements" />
    </div>
  );
}
