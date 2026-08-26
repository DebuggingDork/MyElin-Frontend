"use client";

/** The opening screen — shows the company name set during onboarding and lets the CEO begin. */

import { INITIAL_STATE, BASE_STAFF, OPENING_CASH, headcount, marketDemand } from "@/lib/simulation/constants";
import { inr, n0 } from "@/lib/simulation/format";
import { Eyebrow, Panel, Stat } from "@/components/simulation/Kit";

export function IntroScreen({
  companyName,
  onStart,
  busy,
}: {
  companyName: string;
  onStart: () => void;
  busy?: boolean;
}) {
  const price = INITIAL_STATE.products.pulse.price;
  const team = headcount(BASE_STAFF);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div>
          <Eyebrow tone="text-tone-bad">The desk is yours in a moment</Eyebrow>
          <h2 className="mt-3 font-serif text-[4rem] tracking-tight text-ink leading-[0.95]">
            {companyName}
          </h2>
          <p className="font-mono text-sm text-dim mt-4">Pvt. Ltd. · Bengaluru, Karnataka</p>

          <p className="text-lg text-ink leading-relaxed mt-5 text-pretty">
            You are the chief executive. The company sells a smartwatch called the Nadi Pulse at{" "}
            {inr(price)}, has four thousand customers, fourteen people and {inr(OPENING_CASH)} in
            the bank. The category buys about {n0(marketDemand(1))} units a quarter and you are a
            small part of that. Three funded competitors would like you to stay small.
          </p>
        </div>

        <div className="bg-raise border border-line">
          <header className="border-b border-line px-4 py-3 bg-gradient-to-r from-panel to-transparent">
            <Eyebrow>Company snapshot</Eyebrow>
            <h3 className="font-serif text-lg leading-snug text-ink mt-0.5">
              Where you start, quarter one
            </h3>
          </header>
          <div className="grid grid-cols-2 gap-3 p-4">
            <Stat label="Cash in the bank" value={inr(OPENING_CASH)} />
            <Stat label="Nadi Pulse price" value={inr(price)} />
            <Stat label="Customers" value={n0(INITIAL_STATE.customers)} />
            <Stat label="Team" value={team} sub="people" />
            <Stat label="Category demand" value={n0(marketDemand(1))} sub="units this quarter" />
            <Stat label="Funded rivals" value="3" sub="all want you small" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Panel eyebrow="How this works" title="Four decisions a quarter, and one you cannot take back">
          <p className="text-sm text-dim">
            Each quarter opens with a briefing: what changed, what is holding the company back, and
            what everyone around you wants. You declare a priority, make your decisions, and close
            the quarter. Then you find out what actually happened.
          </p>
          <p className="text-sm text-dim mt-3">
            You will not be shown your revenue before you commit. You will be shown pressure —
            where the company is tight, where it has room — and you will have to decide with that.
            That is the situation the job is actually conducted in.
          </p>
        </Panel>

        <Panel eyebrow="What is being assessed" title="Judgment, not arithmetic">
          <p className="text-sm text-dim">
            Every quarter you say what you are prioritising and what you are giving up. At the
            close, those are compared with what your money actually did and what the company turned
            out to need. Consequences arrive late and out of order, which is the point.
          </p>
        </Panel>
      </div>

      {/* Removed the clunky "Before you begin" block so the design aligns with the screenshot */}

      <button
        onClick={() => onStart()}
        disabled={busy}
        className={
          "w-full py-4 font-serif text-xl transition-all duration-150 " +
          (busy
            ? "bg-raise-2 text-faint cursor-not-allowed"
            : "bg-teal-deep text-white hover:bg-teal hover:shadow-[0_0_32px_-8px_var(--teal)] active:scale-[0.99]")
        }
      >
        {busy ? "Opening the quarter…" : "Take the job →"}
      </button>
    </div>
  );
}
