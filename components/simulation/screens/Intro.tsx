"use client";

/** The opening screen — enhanced with company name customization. */

import { useState } from "react";
import { INITIAL_STATE, BASE_STAFF, OPENING_CASH, headcount, marketDemand } from "@/lib/simulation/constants";
import { Edit2 } from "lucide-react";
import { inr, n0 } from "@/lib/simulation/format";
import { Eyebrow, Panel, Stat } from "@/components/simulation/Kit";

export function IntroScreen({
  onStart,
  busy,
}: {
  onStart: (companyName: string) => void;
  busy?: boolean;
}) {
  const price = INITIAL_STATE.products.pulse.price;
  const team = headcount(BASE_STAFF);

  const [name, setName] = useState("Nadi Wear");
  const trimmed = name.trim();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div>
          <Eyebrow tone="text-tone-bad">The desk is yours in a moment</Eyebrow>
          <div className="group relative mt-3 inline-block w-full max-w-sm">
            <div className="flex items-center gap-4 border-b border-dashed border-teal/30 hover:border-teal/60 focus-within:border-teal/60 pb-2 transition-colors">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={32}
                  placeholder="Nadi Wear"
                  title="Click to rename your company"
                  className="w-full bg-transparent font-serif text-[4rem] tracking-tight text-ink leading-[0.95] outline-none placeholder:text-faint hover:text-teal focus:text-teal transition-colors"
                  style={{
                    border: 'none',
                    padding: 0,
                    boxShadow: 'none',
                  }}
                />
                {/* The dot at the end, exactly as seen in the mockup */}
                <span className="pointer-events-none absolute font-serif text-[4rem] text-ink leading-[0.95] tracking-tight transition-colors group-hover:text-teal group-focus-within:text-teal" style={{ left: `${Math.max(name.length || 9, 2)}ch` }}>
                  .
                </span>
              </div>
              <Edit2 className="h-6 w-6 text-faint group-hover:text-teal transition-colors flex-shrink-0 mt-3" />
            </div>
            <p className="text-xs text-faint mt-2 tracking-wide uppercase">Click to rename</p>
          </div>
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
        onClick={() => onStart(trimmed || "Nadi Wear")}
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
