"use client";

/**
 * The pair of controls that closes every section of a live quarter.
 *
 * It is rendered once, by `SimulationApp`, underneath whichever section is on screen -- not by
 * the sections themselves. The order it walks is the rail's own `tabs` array, passed in, so the
 * two can never drift apart: a section that appears in the rail conditionally (the market
 * event) is in this sequence exactly when the rail shows it.
 *
 * Neither button submits anything. "Move to next section" changes `?tab=`, which is the same
 * navigation the rail performs, so the plan being built in `SimulationApp` is untouched and
 * nothing the CEO has typed is lost. "Closure section" goes to *Close the quarter*, where the
 * existing reflection gate and the existing close button live -- the commit is still made
 * there, by that button, so there is only ever one path to a locked quarter.
 */

import { ArrowRight, ClipboardCheck } from "lucide-react";

/* The two share a height and a serif face so neither reads as an afterthought; only the fill
   separates them. Full-width and stacked below `sm`, side by side above it, matching the
   close-the-quarter button the CEO already meets on the dashboard. */
const BASE =
  "flex w-full items-center justify-center gap-2.5 px-5 py-4 text-center font-serif text-lg transition-colors sm:text-xl";
const PRIMARY = BASE + " bg-chrome text-white hover:bg-danger-deep";
const SECONDARY =
  BASE + " border border-line-2 bg-raise text-ink hover:border-teal/50 hover:bg-raise-2";

export function SectionNav({
  next,
  onNext,
  onClosure,
}: {
  /** The section after this one, or `null` when there is none left to move to. */
  next: { id: string; label: string } | null;
  onNext: () => void;
  onClosure: () => void;
}) {
  return (
    <div className="mt-8 border-t border-line-2 pt-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        {next && (
          <button type="button" onClick={onNext} className={PRIMARY + " sm:flex-1"}>
            Move to next section
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          </button>
        )}
        {/* When there is no next section the closure *is* the next step, so it takes the
            primary fill rather than sitting quietly beside nothing. */}
        <button
          type="button"
          onClick={onClosure}
          className={(next ? SECONDARY : PRIMARY) + " sm:flex-1"}
        >
          <ClipboardCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
          Closure section
        </button>
      </div>
      <p className="mt-3 text-xs text-faint">
        {next
          ? "Next up: " + next.label + ". Everything you have entered here is kept."
          : "The quarter is committed on the closure section, once the questions there are answered."}
      </p>
    </div>
  );
}
